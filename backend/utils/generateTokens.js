const jwt = require("jsonwebtoken");

module.exports = function generateTokens(user, sid) {
  
  const accessToken = jwt.sign(
    { id: user._id, sid },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, sid },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
