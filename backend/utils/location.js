const axios=require("axios");



const getLocationFromIp =async(ip)=>{

    try{

        if(!ip ||ip==="::1"||ip==="127.0.0.1")
        {
            return {city:"Localhost",region:"",country:""};
        }

        const {data} =await axios.get(`https://ipapi.co/${ip}/json/`);

        return {
            city:data.city || "",
            region:data.region || "",
            country:data.country_name || "",
        };
    }
    catch(err)
    {
        return{
             city:"",
            region:"",
            country:"",
        }

    }
}

const getClientIp =(req)=>{

    const forwarded =req.headers["x-forwarded-for"];
    if(forwarded)
        return forwarded.split(",")[0].trim();

    return req.ip ||req.connection.remoteAddress ||req.socket.remoteAddress;

};




module.exports={getClientIp,getLocationFromIp};