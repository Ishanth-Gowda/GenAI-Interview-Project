const userModel = require('../models/user.model'); // import user model
const blacklistTokenModel = require('../models/blacklist.model'); // import blacklist token model
const bcrypt = require('bcryptjs'); // import bcryptjs module for password hashing
const jwt = require('jsonwebtoken'); // import jsonwebtoken module for generating JWT tokens

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const isCrossSite = !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(frontendUrl);
const cookieOptions = {
    httpOnly: true,
    secure: isCrossSite,
    sameSite: isCrossSite ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
}

const RegisterUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            message: 'All fields are required'
        })
    }

    const userExists = await userModel.findOne({
        $or: [{ username }, { email }]  // here, findOne is used to check if a user with the same username or email already exists in the database. The $or operator is used to specify that either condition can be true for a match to be found.
    })
    // in userExists variable, if a user with the same username or email is found, it will contain the user document; otherwise, it will be null.

    if (userExists) {
        return res.status(400).json({
            message: 'User already exists'
        })
    }

    const hashedPwd = await bcrypt.hash(password, 10); // hash (security purpose) the password with a salt round of 10. 
    // Salt rounds determine the computational complexity of the hashing process. A higher number of salt rounds increases the time it takes to hash the password, making it more secure against brute-force attacks. However, it also increases the time it takes to verify passwords during login. A salt round of 10 is a common choice that balances security and performance.

    const newUser = await userModel.create({
        username,
        email,
        password: hashedPwd
    }) // create a new user document in the database with the provided username, email, and hashed password.

    const token = jwt.sign({        // .sign() method is used to generate a JWT token. It takes three arguments: the payload (user information), the secret key (used to sign the token), and optional options (like expiration time).
        id: newUser._id,            // when newUser is created in db, it'll assign new _id to that user object
        username: newUser.username  // id and username are payload (some info related to user)
    }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })    // sign the JWT token with a secret key from env variables

    res.cookie('token', token, cookieOptions) // set the generated JWT token as a cookie in the response. This allows the client to store the token and send it with subsequent requests for authentication.
    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        } // send the response with a success message and the newly created user's information (id, username, and email) in JSON format. The status code 201 indicates that a new resource has been successfully created.
    })
}

const LoginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required'
        })
    }

    const userExists = await userModel.findOne({ email }) // find the user with the provided email in the database
    if (!userExists) {
        return res.status(404).json({
            message: 'Invalid email or password. Please register again if not registered.'
        })
    }

    const passwordValid = await bcrypt.compare(password, userExists.password) // compare the provided password with the hashed password stored in the database
    if (!passwordValid) {
        return res.status(401).json({
            message: 'Invalid email or password'
        })
    } // in passwordValid variable, if the provided password matches the hashed password, it will be true; otherwise, it will be false value.

    const token = jwt.sign({
        id: userExists._id,
        username: userExists.username
    }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })

    res.cookie('token', token, cookieOptions) // set the generated JWT token as a cookie in the response. This allows the client to store the token and send it with subsequent requests for authentication.
    res.status(200).json({
        message: 'User logged in successfully',
        user: {
            id: userExists._id,
            username: userExists.username,
            email: userExists.email
        }
    })
}

const LogoutUser = async (req, res) => {
    const token = req.cookies.token; // retrieve the JWT token from the request cookies
    if (token) {
        await blacklistTokenModel.create({ token })
    }

    res.clearCookie('token', cookieOptions) // clear the token cookie from the client side, effectively logging the user out.
    res.status(200).json({
        message: 'User logged out successfully'
    })
}

const GetUserDetails = async (req, res) => {
    const userDetails = await userModel.findById(req.user.id) // find the user in the database using the user ID stored in req.user (which was set by the auth middleware from decoded variable (which had the payload of user info))
    res.status(200).json({
        message: 'User details fetched successfully',
        user: {
            id: userDetails._id,
            username: userDetails.username,
            email: userDetails.email
        }
    })
}


module.exports = { RegisterUser, LoginUser, LogoutUser, GetUserDetails }