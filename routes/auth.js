const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { generateAccessToken, checkPassword } = require("../utils");

const router = express.Router();
const prisma = new PrismaClient();
const { NoRequiredData, LoginError } = require("../errors/system");
const { UserNotFound } = require("../errors/users");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json(NoRequiredData);
    return;
  }

  const user = await prisma.user.findFirst({
    where: { email: email, isArchived: false },
  });

  if (!user) {
    res.status(400).json(UserNotFound);
    return;
  }
  const passwordCheck = await checkPassword(user, password);
  if (!passwordCheck) {
    res.status(403).json(LoginError);
    return;
  }

  const token = generateAccessToken({
    username: user.email,
    identifier: user.identifier,
  });

  res.json({ userIdentifier: user.identifier, accessToken: token });
});

router.post("/logout", async (req, res) => {
  const { userIdentifier } = req.body;
  if (!userIdentifier) {
    res.status(400).json(NoRequiredData);
    return;
  }
  //TODO: delete token
  res.sendStatus(200);
});

module.exports = router;
