const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: true,
        unique: true
    },

    balance: {
        type: Number,
        default: 0
    },

    blocked: {
        type: Boolean,
        default: false
    },

    referralCode: {
        type: String,
        unique: true
    },

    referredBy: {
        type: String,
        default: ""
    },

    referralEarnings: {
        type: Number,
        default: 0
    },

    invitedUsers: {
        type: Number,
        default: 0
    },

    referralPaid: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("User", userSchema);