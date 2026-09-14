const jwt = require('jsonwebtoken');
require('dotenv').config();

const blacklistTokenModel = require('../models/blacklist.model')

const checkForUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: 'Token not found, please login again'
        })
    }

    const isTokenBlacklisted = await blacklistTokenModel.findOne({ token }) // check if the token is present in the blacklist collection in the database. If it is present, it means the user has logged out and the token is no longer valid.
    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: 'Invalid token, please login again'
        })
    } // in isTokenBlacklisted variable, if the token is present in the blacklist collection, it will return the token object, else it will return null. If it is not null, it means the token is blacklisted and the user has logged out, so we return the error response, and if its null, it means the token is valid and we can proceed to verify the token.

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) // verify the token using the secret key stored in env variables. If the token is valid, it will return the decoded payload (user information) which is stored in the decoded variable, else it'll throw an error and catch block will be executed.
        req.user = decoded // store the decoded payload (user information) in the req.user object, so that it can be accessed in controllers or route handlers that require user authentication.
        next() // if token is valid, execute next function, which is the route handler
    }
    catch (error) {
        return res.status(401).json({
            message: 'Invalid token'
        })
    }

}

module.exports = { checkForUser }

// In this code snippet, we are implementing a middleware function called checkForuser that checks for the presence and validity of a JWT token in the request cookies. If the token is found and valid, it decodes the token and attaches the user information to the req.user object, allowing subsequent middleware or route handlers to access it. If the token is not found or invalid, it returns an appropriate error response.