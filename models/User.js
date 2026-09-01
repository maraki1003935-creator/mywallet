const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        default: "New User"
    },

    // ==============================
    // WALLET BALANCE
    // ==============================

    balance: {
        type: Number,
        default: 0
    },

    // ==============================
    // REFERRAL
    // ==============================

    referralCode: {
        type: String,
        unique: true,
        required: true
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

    // TRUE after the user's first
    // approved deposit bonus is paid
    referralPaid: {
        type: Boolean,
        default: false
    },

    totalEarnings: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        default: "Active"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports =
    mongoose.model("User", UserSchema);