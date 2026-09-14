const mongoose = require('mongoose'); // import mongoose module

const blacklistTokenSchema = new mongoose.Schema({
        token: {
            type: String,
            required: [true, 'Token is required to add to blacklist']
        }
    }, { timestamps: true } // automatically add createdAt and updatedAt fields to the schema
)

const blacklistTokenModel = mongoose.model('blacklistTokens', blacklistTokenSchema); // create a model for blacklist token schema
module.exports = blacklistTokenModel;

// this blacklistTokenModel can be used to store JWT tokens that have been invalidated (e.g., when a user logs out) so that they cannot be used for authentication anymore.
// this is more secure than just deleting the token from the client side, as it ensures that even if someone has the token, it will not be accepted by the server if it is in the blacklist.