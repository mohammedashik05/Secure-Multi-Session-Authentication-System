const jwt = require("jsonwebtoken");
const Session = require("../models/Session");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No access token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err && err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "ACCESS_TOKEN_EXPIRED" });
      }
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }

      // CHECK SESSION VALIDITY
      const session = await Session.findOne({
        sessionId: decoded.sid,
        userId: decoded.id,
        isValid: true,
      });

      if (!session) {
        return res.status(401).json({ message: "SESSION_INVALID" });
      }

      req.user = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin Only" });
  }
  next();
};
