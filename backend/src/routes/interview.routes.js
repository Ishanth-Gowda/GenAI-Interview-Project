const express = require('express')
const { checkForUser } = require('../middlewares/auth.middleware')
const { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController } = require('../controllers/interview.controller')
const upload = require('../middlewares/file.middleware')

const interviewRouter = express.Router()

/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description, resume pdf, and jd
 * @access private
 */

interviewRouter.post('/', checkForUser, upload.single('resume'), generateInterviewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", checkForUser, getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", checkForUser, getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", checkForUser, generateResumePdfController)


module.exports = interviewRouter