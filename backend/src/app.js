const express = require('express'); // import express module
const cookieParser = require('cookie-parser'); // import cookie-parser module
const cors = require("cors");

const app = express(); // create instance of express
app.use(express.json()); // middleware to parse JSON request bodies
app.use(cookieParser()); // middleware to parse cookies from incoming requests
// parse meaning is to convert the incoming data into a format that can be easily used by the application. In this case, express.json() middleware parses the incoming JSON request bodies and makes it available in req.body, and cookieParser() middleware parses the cookies from incoming requests and makes them available in req.cookies.

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error('Origin is not allowed by CORS'))
    },
    credentials: true
}))

const authRoutes = require('./routes/auth.routes'); // import authentication routes file
app.use('/api/auth', authRoutes); // this is the base path for all authentication routes like login, signup, etc.

const interviewRouter = require('./routes/interview.routes')
app.use('/api/interview', interviewRouter)

app.use((error, req, res, next) => {
    console.error(error)
    res.status(error.statusCode || 500).json({
        message: error.message || "Unable to generate the interview plan."
    })
})

module.exports = app;