const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: true
    },

    telebirr: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    withdrawCode: {
        type: String,
        required: true,
        unique: true
    },

    status: {
        type: String,
        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Withdraw", withdrawSchema);