const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        sessionId:{type:String,required:true,unique:true},
        userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},

        userAgent:String,
        browser:String,
        os:String,
        device:String,

        ipAddress:String,
        location:String,

        isValid:{type:Boolean,default:true},
        createdAt:{type:Date,default:Date.now},
        lastActive:{type:Date,default:Date.now}, 
    },
    {
        versionKey:false
    },
);


module.exports =mongoose.model("Session",sessionSchema);
