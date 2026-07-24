const mongoose = require("mongoose");

const DepositSchema = new mongoose.Schema({

phone:{
type:String,
required:true
},

amount:{
type:Number,
required:true
},

transactionId:{
type:String,
required:true
},

screenshot:{
type:String,
default:""
},

status:{
type:String,
default:"Pending"
},

adminRemark:{
type:String,
default:""
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Deposit", DepositSchema);