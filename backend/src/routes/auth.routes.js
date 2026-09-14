const express = require('express');
// can also be written by destructuring as: const {Router} = require('express') and then use Router() instead of express.Router() below

const { RegisterUser, LoginUser, LogoutUser, GetUserDetails } = require('../controllers/auth.controller')
const { checkForUser } = require('../middlewares/auth.middleware')

const router = express.Router(); // create router instance from express for handling routes

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * 
 * NOTE: The above comment is a JSDoc comment that describes the route for registering/login a new user. It specifies the HTTP method (POST), the endpoint (/api/auth/register), a brief description of what the route does (Register a new user), and the access level (Public, meaning no authentication is required to access this route).
 */


router.post('/register', RegisterUser); // route for registering a new user
router.post('/login', LoginUser); // route for logging in a user
router.get('/logout', LogoutUser); // route for logging out a user
router.get('/getUser', checkForUser, GetUserDetails); // route for getting the logged-in user's information


module.exports = router; // export the router instance for paths/routes of authentication like login, signup, etc.