const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { generateAccessToken, checkPassword } = require("../utils");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  const passwordCheck = await checkPassword(user, password);
  if (!passwordCheck)
    res.status(403).json({
      message: "Invalid email or password!",
      reasonCode: "INVALID EMAIL OR PASSWORD",
    });

  const token = generateAccessToken({
    username: user.email,
    identifier: user.identifier,
  });

  res.json({ userIdentifier: user.identifier, accessToken: token });
});

router.post("/logout", async (req, res) => {
  const { userIdentifier } = req.body;
  //TODO: delete token
  res.sendStatus(200);
});

module.exports = router;
