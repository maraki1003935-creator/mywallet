const mongoose = require("mongoose");

const WithdrawalSchema = new mongoose.Schema({

phone:{
type:String,
required:true
},

amount:{
type:Number,
required:true
},

telebirrNumber:{
type:String,
required:true
},

withdrawCode:{
type:String,
required:true,
unique:true
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

module.exports = mongoose.model("Withdrawal", WithdrawalSchema);