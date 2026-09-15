const { GoogleGenAI } = require('@google/genai')
const z = require('zod')
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

// Ordered from most to least preferred. If a model keeps failing with a transient
// error, we fall back to the next one instead of failing the whole request.
const MODEL_FALLBACK_CHAIN = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"]

/**
 * Wraps ai.models.generateContent with retry-with-backoff per model, and falls
 * back to the next model in MODEL_FALLBACK_CHAIN once a model's retries are exhausted.
 * Only retries on transient errors (503 high-demand / 429 rate-limit) - anything else
 * (bad schema, auth failure, etc.) is thrown immediately so it isn't retried pointlessly.
 */
async function generateContentWithRetry({ contents, config }, { maxRetriesPerModel = 3, initialDelayMs = 1000 } = {}) {
    let lastError

    for (const model of MODEL_FALLBACK_CHAIN) {
        for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
            try {
                return await ai.models.generateContent({ model, contents, config })
            } catch (err) {
                lastError = err

                const status = err?.status || err?.code
                const isTransient = status === 503 || status === 429 || /high demand|overloaded/i.test(err?.message || "")

                if (!isTransient) {
                    throw err
                }

                const delay = initialDelayMs * Math.pow(2, attempt)
                console.warn(`[Gemini] ${model} attempt ${attempt + 1} failed (${status}). Retrying in ${delay}ms...`)
                await new Promise((res) => setTimeout(res, delay))
            }
        }
        console.warn(`[Gemini] Exhausted retries on ${model}, falling back to next model...`)
    }

    throw lastError
}

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe "),

    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question which can be asked in the interview"),
        intention: z.string().describe("The intention of interviewers behind asking this question and what answer they expect"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take, how can I add on to the follow-up questions ")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question which can be asked in the interview"),
        intention: z.string().describe("The intention of interviewers behind asking this question and what answer they expect"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take, how can I add on to the follow-up questions ")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),

    skillGaps: z.array(z.object({
        skill: z.string().describe("the skills which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skills matching the job describe, ranked as low, medium, high"),
    })).describe("List of skill gaps in the candidate's profile along with their serverity"),

    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in preparation plan, starting from day 1"),
        focus: z.string().describe("The main focus areas of the particular day in the preparation plan, for example, what skills to focus on for today's learning"),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),

    title: z.string().describe("The title of the job for which the interview report is generated")
})
// this above schema is different from the schema in database, this schema is used to tell to the AI what all is required and in what format.
// The schema is defined using zod library, which is a TypeScript-first schema declaration and validation library. z.toJSONSchema converts the zod schema to JSON schema, which Gemini uses to constrain its response format.

const generateInterviewReport = async ({ resume, selfDescription, jobDescription }) => {

    const prompt = `Generate an interview report using exactly the JSON structure described by the response schema. Do not add any other keys, candidate details, contact information, ratings, or recommendation fields.

                    Candidate details:
                    Resume:${resume}
                    Self Description:${selfDescription}
                    Job Description:${jobDescription}`

    const responseSchema = z.toJSONSchema(interviewReportSchema)
    delete responseSchema.$schema

    const response = await generateContentWithRetry({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema
        }
    })

    const report = interviewReportSchema.parse(JSON.parse(response.text))
    return report

}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const responseSchema = z.toJSONSchema(resumePdfSchema)
    delete responseSchema.$schema

    const response = await generateContentWithRetry({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema
        }
    })

    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }