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

    //  Check if this is current session
    const isCurrent = sid === req.user.sid;

    res.json({
      message: "Session removed",
      current: isCurrent,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.logoutAllSessions = async (req, res) => {
  try {
    await Session.updateMany(
      { userId: req.user.id },
      { isValid: false }
    );

    res.json({
      message: "Logged out from all devices",
      logout: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
