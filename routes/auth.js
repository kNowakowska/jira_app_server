const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();
const { generateAccessToken } = require("../auth");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //TODO: checking if password is correct
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  const token = generateAccessToken({
    username: user.email,
    identifier: user.identifier,
  });

  res.json({ userIdentifier: user.identifier, accessToken: token });
});

module.exports = router;
