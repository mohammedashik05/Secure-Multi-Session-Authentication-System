const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const UAParser = require("ua-parser-js");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Session = require("../models/Session");
const generateToken = require("../utils/generateToken");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// helper to set cookie
const sendAuthCookies = (res, token, sid) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("sid", sid, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

//helper to extraect device details

const getDeviceInfo = (req) => {
  const uaString = req.headers["user-agent"] || "";
  const parser = new UAParser(uaString);
  const result = parser.getResult();

  return {
    userAgent: uaString,
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "Desktop", // default
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

    const token = generateToken(user, sid);
    sendAuthCookies(res, token, sid);

    res.status(201).json({
      message: "User Registered",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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

    // 🔥 Create new session for this login
    const sid = uuidv4();
    const deviceInfo = getDeviceInfo(req);

    await Session.create({
      sessionId: sid,
      userId: user._id,
      ...deviceInfo,
      isValid: true,
    });

    const token = generateToken(user, sid);
    sendAuthCookies(res, token, sid);

    res.json({
      message: "Logged in",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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

    // 🔥 Create session
    const sid = uuidv4();
    const deviceInfo = getDeviceInfo(req);

    await Session.create({
      sessionId: sid,
      userId: user._id,
      ...deviceInfo,
      isValid: true,
    });

    const token = generateToken(user, sid);
    sendAuthCookies(res, token, sid);

    res.json({
      message: "Google Login Success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
    //invalidate the current session only
    if (req.user?.sid) {
      await Session.findOneAndUpdate(
        { sessionId: req.user.sid },
        { isValid: false }
      );
    }

    res.clearCookie("token");
    res.clearCookie("sid");

    res.json({ message: "Logged Out" });
  } catch (err) {
    console.error("Logout error", err);
    res.status(500).json({ message: "Server error" });
  }
};
