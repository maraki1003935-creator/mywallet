const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema({

    phone: {
        type: String,
        required: true
    },

    ip: {
        type: String,
        default: ""
    },

    browser: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        default: "Success"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("LoginActivity", loginActivitySchema);