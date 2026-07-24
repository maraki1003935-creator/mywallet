const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({

    phone: String,

    amount: Number,

    screenshot: String,

    status: {
        type: String,
        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Deposit", depositSchema);