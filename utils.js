const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateAccessToken = (userData) => {
  return jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
};

const checkPassword = async (user, password) => {
  return (
    user && !user.isArchived && bcrypt.compareSync(password, user.password)
  );
};

module.exports = { generateAccessToken, checkPassword };
