import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useState } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context
    const [error, setError] = useState("")
    const [resumeLoading, setResumeLoading] = useState(false)

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setError("")
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
            const responseData = error.response?.data
            const responseMessage = typeof responseData === "string"
                ? responseData.replace(/<[^>]*>/g, "").trim()
                : responseData?.message
            setError(responseMessage || (error.request
                ? "The server did not respond. Please make sure the backend is running."
                : "Unable to generate the interview plan. Please try again."))
        } finally {
            setLoading(false)
        }

        return response?.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            const interviewReports = Array.isArray(response?.interviewReports)
                ? response.interviewReports
                : []
            setReports(interviewReports)
        } catch (error) {
            console.log(error)
            setReports([])
        } finally {
            setLoading(false)
        }

        return response?.interviewReports ?? []
    }

    const getResumePdf = async (interviewReportId) => {
        setResumeLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setResumeLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId])

    return { loading, resumeLoading, report, reports, error, generateReport, getReportById, getReports, getResumePdf }

}