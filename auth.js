const jwt = require("jsonwebtoken");

const generateAccessToken = (userData) => {
  return jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
};

module.exports = { generateAccessToken };
