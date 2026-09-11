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

vat: {
    type: Number,
    default: 0
},

payoutAmount: {
    type: Number,
    default: 0
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