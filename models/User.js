const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    // ======================================
    // USER PHONE
    // ======================================

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },


    // ======================================
    // PRIVATE WALLET BALANCE
    // ======================================

    balance: {
        type: Number,
        default: 0
    },


    // ======================================
    // USER STATUS
    // ======================================

    blocked: {
        type: Boolean,
        default: false
    },


    // ======================================
    // USER'S OWN REFERRAL CODE
    // ======================================

    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },


    // ======================================
    // REFERRAL CODE USED BY THIS USER
    // ======================================

    referredBy: {
        type: String,
        default: ""
    },


    // ======================================
    // TOTAL REFERRAL EARNINGS
    // ======================================

    referralEarnings: {
        type: Number,
        default: 0
    },


    // ======================================
    // NUMBER OF INVITED USERS
    // ======================================

    invitedUsers: {
        type: Number,
        default: 0
    },


    // ======================================
    // REFERRAL BONUS PAID
    // ======================================

    referralPaid: {
        type: Boolean,
        default: false
    },


    // ======================================
    // ACCOUNT CREATED DATE
    // ======================================

    createdAt: {
        type: Date,
        default: Date.now
    }

});


// ======================================
// EXPORT USER MODEL
// ======================================

module.exports =
    mongoose.model("User", userSchema);