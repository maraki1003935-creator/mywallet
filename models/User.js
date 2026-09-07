const mongoose = require("mongoose");


// ======================================================
// USER SCHEMA
// ======================================================

const UserSchema = new mongoose.Schema({

    // ==================================================
    // PHONE NUMBER
    // ==================================================

    phone: {
        type: String,
        required: true,
        unique: true
    },


    // ==================================================
    // USER NAME
    // ==================================================

    name: {
        type: String,
        default: "New User"
    },


    // ==================================================
    // WALLET BALANCE
    // ==================================================

    balance: {
        type: Number,
        default: 0
    },


    // ==================================================
    // REFERRAL
    // ==================================================

    referralCode: {
        type: String,
        unique: true,
        required: true
    },


    // Referral code of the person
    // who invited this user

    referredBy: {
        type: String,
        default: ""
    },


    // Total referral money earned

    referralEarnings: {
        type: Number,
        default: 0
    },


    // Number of users who made
    // their first approved deposit

    invitedUsers: {
        type: Number,
        default: 0
    },


    // TRUE after this user's
    // first approved deposit bonus
    // has been paid

    referralPaid: {
        type: Boolean,
        default: false
    },


    // Total earnings
    // including bonuses/referrals

    totalEarnings: {
        type: Number,
        default: 0
    },


    // ==================================================
    // ACCOUNT STATUS
    // ==================================================

    status: {
        type: String,
        default: "Active"
    },


    // ==================================================
    // ACCOUNT CREATION DATE
    // ==================================================

    createdAt: {
        type: Date,
        default: Date.now
    }

});


// ======================================================
// EXPORT USER MODEL
// ======================================================

module.exports =
    mongoose.model("User", UserSchema);