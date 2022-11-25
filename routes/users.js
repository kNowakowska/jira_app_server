const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const express = require("express");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { isArchived: false },
    select: {
      firstname: true,
      surname: true,
      email: true,
      identifier: true,
    },
  });
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { identifier: id },
    select: {
      firstname: true,
      surname: true,
      email: true,
      identifier: true,
    },
  });
  if (user) res.json(user);
  else res.status(400).json("User not found!");
});

router.post("/", async (req, res) => {
  const { firstname, surname, email, password } = req.body;

  if (!(firstname || surname || email || password))
    res.status(400).json("Missing some required data!");
  const userByEmail = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (userByEmail)
    res.status(400).json("User with given email already exists.");

  const encryptedPswd = bcrypt.hashSync(password, 10);
  const user = await prisma.user.create({
    data: {
      firstname,
      surname,
      email,
      password: encryptedPswd,
    },
  });
  res.status(200).json({ identifier: user.identifier });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstname, surname, email, password } = req.body;
  const userByEmail = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (email && userByEmail)
    res.status(400).json("User with given email already exists.");

  const existingUser = await prisma.user.findUnique({
    where: { identifier: id },
  });
  const userUpdateData = {
    firstname: firstname || existingUser.firstname,
    surname: surname || existingUser.surname,
    email: email || existingUser.email,
  };
  if (password) {
    const encryptedPswd = bcrypt.hashSync(password, 10);
    userUpdateData["password"] = encryptedPswd;
  }
  const user = await prisma.user.update({
    where: { identifier: id },
    data: userUpdateData,
    select: {
      firstname: true,
      surname: true,
      email: true,
      identifier: true,
    },
  });
  res.json(user);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const existingUser = await prisma.user.findUnique({
    where: { identifier: id },
  });
  const userUpdateData = {
    firstname: existingUser.firstname,
    surname: existingUser.surname,
    email: existingUser.email,
  };

  const user = await prisma.user.update({
    where: { identifier: id },
    data: {
      ...userUpdateData,
      isArchived: true,
    },
  });
  //TODO: Add deleting token to ensure user cannot log in again
  res.status(200);
});

module.exports = router;
