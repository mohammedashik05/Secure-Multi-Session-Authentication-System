const mongoose = require("mongoose");

const LoginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ipAddress: String,
    city: String,
    region: String,
    country: String,

    browser: String,
    os: String,
    device: String,
    userAgent: String,

    isSuspicious: {
      type: Boolean,
      default: false,
    },

    reason: String,
  },
  {
    timestamps: true, // creates createdAt & updatedAt
  }
);

// ✅ AUTO DELETE AFTER 30 DAYS (TTL INDEX)
LoginLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

module.exports = mongoose.model("LoginLog", LoginLogSchema);
