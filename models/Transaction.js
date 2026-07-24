const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: "Completed"
    },

    reference: {
        type: String,
        default: ""
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Transaction", transactionSchema);