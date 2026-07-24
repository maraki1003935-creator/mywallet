const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

phone:{
type:String,
required:true,
unique:true
},

name:{
type:String,
default:"New User"
},

balance:{
type:Number,
default:0
},

referralCode:{
type:String,
unique:true
},

referredBy:{
type:String,
default:""
},

referralEarnings:{
type:Number,
default:0
},

totalEarnings:{
type:Number,
default:0
},

status:{
type:String,
default:"Active"
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("User",UserSchema);