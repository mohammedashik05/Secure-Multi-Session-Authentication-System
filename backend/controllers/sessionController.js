const Session = require("../models/Session");

// GET /api/sessions/my
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id , isValid:true}).sort({
      createdAt: -1,
    });

    res.json({ sessions });
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// DELETE /api/sessions/:sid
exports.deleteSession = async (req, res) => {
  try {
    const { sid } = req.params;

    const session = await Session.findOneAndUpdate(
      { sessionId: sid, userId: req.user.id },
      { isValid: false }
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    let state="";
    // 🌟 If user logs out the CURRENT session → clear cookies
    if (sid === req.cookies.sid) {
      res.clearCookie("token");
      res.clearCookie("sid");
      state="cur";
    }

    res.json({ message: "Session Removed" , state });
  } catch (err) {
    console.error("Delete session error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// DELETE /api/sessions/all
exports.logoutAllSessions = async (req, res) => {
  try {
    await Session.updateMany(
      { userId: req.user.id },
      { isValid: false }
    );

    res.clearCookie("token");
    res.clearCookie("sid");
    
    res.json({ message: "Logged out from all devices" });
  } catch (err) {
    console.error("Logout all error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
