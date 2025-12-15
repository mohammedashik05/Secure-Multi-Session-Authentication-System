const axios = require("axios");

// Normalize IPv6 → IPv4
const normalizeIp = (ip) => {
  if (!ip) return null;
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  return ip;
};

const getClientIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return normalizeIp(xff.split(",")[0].trim());
  return normalizeIp(req.ip);
};

const getLocationFromIp = async (ip) => {
  try {
    if (!ip || ip === "127.0.0.1" || ip === "::1") {
      return { city: "Localhost", region: "", country: "" };
    }

    const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 3000,
    });

    return {
      city: data.city || "",
      region: data.region || "",
      country: data.country_name || "",
    };
  } catch {
    return { city: "", region: "", country: "" };
  }
};

module.exports = {
  getClientIp,
  getLocationFromIp,
};
