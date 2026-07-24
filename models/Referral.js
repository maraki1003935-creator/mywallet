const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema({

referrerPhone:{
type:String,
required:true
},

referredPhone:{
type:String,
required:true
},

referralCode:{
type:String,
required:true
},

reward:{
type:Number,
default:0
},

status:{
type:String,
default:"Pending"
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Referral", ReferralSchema);