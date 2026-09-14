require("dotenv").config(); // import and configure dotenv module
const app = require('./src/app'); // import the app module
const connectDB = require('./src/db/db'); // import the connectDB function
connectDB(); // connect to db



// const { resume, selfDescription, jobDescription } = require("./src/services/temp")
// const generateInterviewReport = require('./src/services/ai.service')
// generateInterviewReport({ resume, selfDescription, jobDescription })
    // .then((report) => console.log(JSON.stringify(report, null, 2)))
    // .catch((error) => console.error("Failed to generate interview report:", error))



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
}); // starting of server

