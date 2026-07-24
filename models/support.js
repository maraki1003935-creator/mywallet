const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: true
    },

    subject: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: "Open"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Support", supportSchema);