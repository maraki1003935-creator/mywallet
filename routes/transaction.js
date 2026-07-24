const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({

phone:{
type:String,
required:true
},

type:{
type:String,
required:true
},

amount:{
type:Number,
required:true
},

status:{
type:String,
default:"Pending"
},

reference:{
type:String,
default:""
},

description:{
type:String,
default:""
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Transaction", TransactionSchema);