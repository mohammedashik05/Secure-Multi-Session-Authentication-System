const LoginLog = require("../models/LoginLog");
const { getLocationFromIp, getClientIp } = require("../utils/location");
const { sendSecurityAlertEmail } = require("../utils/email");

const isSuspicious = (last, current) => {
  if (!last) return { status: false, reason: "" };

  let reasons = [];

  if (last.ipAddress !== current.ipAddress) reasons.push("New IP");
  if (last.city !== current.city) reasons.push("New City");
  if (last.region !== current.region) reasons.push("New Region");
  if (last.country !== current.country) reasons.push("New Country");
  if (last.browser !== current.browser) reasons.push("New Browser");
  if (last.os !== current.os) reasons.push("New OS");
  if (last.device !== current.device) reasons.push("New Device");

  return { status: reasons.length > 0, reasons: reasons.join(", ") };
};

const handleLoginSecurity = async (user, deviceInfo, req) => {
  const ip = getClientIp(req);
  const loc = await getLocationFromIp(ip);

  const current = {
    ipAddress: ip,
    city: loc.city,
    region: loc.region,
    country: loc.country,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    device: deviceInfo.device,
  };
  
  
  const last =await LoginLog.findOne({userId:user._id}).sort({createdAt:-1});
  const check =isSuspicious(last,current);
  
  
  await LoginLog.create({
      ...current,
      userId: user._id,
      isSuspicious: check.status,
      reason: check.reason,
    });
    
    if (check.status) {
        await sendSecurityAlertEmail({
            to: user.email,
            ipAddress: ip,
            ...loc,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            device: deviceInfo.device,
            time: new Date().toLocaleString(),
        });
    }
    
    return check;
    
};


module.exports={handleLoginSecurity};