const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({

    phone:{
        type:String,
        required:true,
        unique:true
    },

    name:{
        type:String,
        default:""
    },

    email:{
        type:String,
        default:""
    },

    password:{
        type:String,
        default:""
    },

    photo:{
        type:String,
        default:"default.png"
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

module.exports=mongoose.model("Profile",profileSchema);