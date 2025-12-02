const mongoose =require ("mongoose");

const LoginLogSchema =new mongoose.Schema({
    userId :{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},

    ipAddress:String,
    city:String,
    region:String,
    country:String,

    browser :String,
    os:String,
    device:String,
    useragent:String,

    isSuspicious :{type:Boolean,default:false},
    reason:String,
},
{timestamps:true}
);


//delete log after 30 days

LoginLogSchema.index({createAt:1},{expires:"30d"});


module.exports=mongoose.model("LoginLog",LoginLogSchema);

