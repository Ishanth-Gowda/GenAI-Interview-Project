const mongoose = require('mongoose'); // import mongoose module

const userSchema = new mongoose.Schema({ // create a new schema for user
    username: {
        type: String,
        required: true,
        unique: [true, 'Username already exists']
    },
    email: {
        type: String,
        unique: [true, 'Email already exists'],
        required: true
    },
    password: {
        type: String,
        required: true
        // no need of password to be unique since we are already checking unique for username and email, and since password will be anyways hashed while storing,
        // so if two users happen to choose the exact same password (e.g., Password123), the hashing process generates a completely different, random string for each user.
        // If you set unique: true on the password field, Mongoose builds a unique database index. The database will reject a new user only if their final hashed string matches an existing hash 
    }
})

const userModel = mongoose.model('users', userSchema); // create a model for user schema
module.exports = userModel; // export the user model