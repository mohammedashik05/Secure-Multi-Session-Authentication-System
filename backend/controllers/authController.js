const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const UAParser = require("ua-parser-js");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Session = require("../models/Session");
const generateToken = require("../utils/generateTokens");
const { handleLoginSecurity } = require("../utils/loginSecurity"); // 🔥 Level 5
const generateTokens = require("../utils/generateTokens");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// helper to set cookie
const sendRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// helper to extract device details
const getDeviceInfo = (req) => {
  const uaString = req.headers["user-agent"] || "";
  const parser = new UAParser(uaString);
  const result = parser.getResult();

  return {
    userAgent: uaString,
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "Desktop",
    ipAddress:
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress?.replace(/^::ffff:/, "") ||
      "Unknown",
  };
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      authProvider: "local",
    });

    const sid = uuidv4();
    const deviceInfo = getDeviceInfo(req);

    await Session.create({
      sessionId: sid,
      userId: user._id,
      ...deviceInfo,
      isValid: true,
    });

   const {accessToken,refreshToken} = generateTokens(user,sid);
   sendRefreshCookie(res,refreshToken);

    // log first login (won't be suspicious because no last log yet)
    const security = await handleLoginSecurity(user, deviceInfo, req);

    res.status(201).json({
      message: "User Registered",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      security, 
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    
    const sid = uuidv4();
    const deviceInfo = getDeviceInfo(req);
    
    await Session.create({
      sessionId: sid,
      userId: user._id,
      ...deviceInfo,
      isValid: true,
    });
    
    const { accessToken, refreshToken } = generateTokens(user, sid);
    sendRefreshCookie(res,refreshToken);

    // log & check if suspicious, send email if needed
    const security = await handleLoginSecurity(user, deviceInfo, req);

    res.json({
      message: "Logged in",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      security, // { isSuspicious, reason, location }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/google
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential)
      return res.status(400).json({ message: "No Google token provided" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        authProvider: "google",
      });
    }

    const sid = uuidv4();
    const deviceInfo = getDeviceInfo(req);

    await Session.create({
      sessionId: sid,
      userId: user._id,
      ...deviceInfo,
      isValid: true,
    });

    const {accessToken,refreshToken} =generateTokens(user,sid);
   sendRefreshCookie(res,refreshToken);

    //  suspicious login check + email
    const security = await handleLoginSecurity(user, deviceInfo, req);

    res.json({
      message: "Google Login Success",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      security,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    if (req.user?.sid) {
      await Session.findOneAndUpdate(
        { sessionId: req.user.sid },
        { isValid: false }
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api/auth",
    });

    res.json({ message: "Logged Out" });
  } catch (err) {
    console.error("Logout error", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // issue new access token
      const accessToken = jwt.sign(
        { id: user._id, sid: decoded.sid },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    });

  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
