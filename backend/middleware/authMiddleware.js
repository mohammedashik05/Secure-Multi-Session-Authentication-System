const jwt = require("jsonwebtoken");
const Session = require("../models/Session");

exports.protect = async (req, res, next) => {
  const token = req.cookies.token;
  const sidCookie = req.cookies.sid;

  if (!token || !sidCookie) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

     // Check if sid in token matches sid cookie
    if (decoded.sid !== sidCookie) {
      return res.status(401).json({ message: "Session mismatch" });
    }
    // Check session in DB
    const session = await Session.findOne({
      sessionId: decoded.sid,
      isValid: true,
    });

    if (!session) {
      return res.status(403).json({ message: "Session expired or removed" });
    }

     // Update last active
    session.lastActive = new Date();
    await session.save();

      // Attach to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      sid: decoded.sid,
    };
  
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin Only" });
  }
  next();
};
