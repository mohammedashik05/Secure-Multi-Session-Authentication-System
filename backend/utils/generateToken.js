const jwt= require("jsonwebtoken");


const generateToken =(user,sessionId)=>{

    return jwt.sign(
        {
            id:user._id,
            email:user.email,
            role:user.role,
            sid:sessionId,
        },
        process.env.JWT_SECRET,
        {expiresIn:"7d"}
    );
};



module.exports =generateToken;