const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const express = require("express");
const { UserNotFound, UserExists, NoRequiredData } = require("../errors/users");

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
  const user = await prisma.user.findFirst({
    where: { identifier: id, isArchived: false },
    select: {
      firstname: true,
      surname: true,
      email: true,
      identifier: true,
    },
  });
  if (user) res.json(user);
  else {
    res.status(400).json(UserNotFound);
    return;
  }
});

router.post("/", async (req, res) => {
  const { firstname, surname, email, password } = req.body;

  if (!firstname || !surname || !email || !password) {
    res.status(400).json(NoRequiredData);
    return;
  }
  const userByEmail = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (userByEmail) {
    res.status(400).json(UserExists);
    return;
  }

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

  const existingUser = await prisma.user.findUnique({
    where: { identifier: id },
  });
  if (!existingUser) {
    res.status(400).json(UserNotFound);
    return;
  }

  const userByEmail = await prisma.user.findFirst({
    where: {
      email: email,
      NOT: {
        identifier: {
          equals: id,
        },
      },
    },
  });
  if (email && userByEmail) {
    res.status(400).json(UserExists);
    return;
  }

  const userUpdateData = {
    firstname: firstname || existingUser.firstname,
    surname: surname || existingUser.surname,
    email: email || existingUser.email,
  };
  if (password) {
    const encryptedPswd = bcrypt.hashSync(password, 10);
    userUpdateData["password"] = encryptedPswd;
  }
  let user = null;
  try {
    user = await prisma.user.update({
      where: { identifier: id },
      data: userUpdateData,
      select: {
        firstname: true,
        surname: true,
        email: true,
        identifier: true,
      },
    });
  } catch (e) {
    res.status(400).json(UserNotFound);
    return;
  }
  res.json(user);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const existingUser = await prisma.user.findUnique({
    where: {
      identifier: id,
    },
  });

  if (!existingUser) {
    res.status(400).json(UserNotFound);
    return;
  }

  const userUpdateData = {
    firstname: existingUser.firstname,
    surname: existingUser.surname,
    email: existingUser.email,
  };

  let user = null;
  try {
    user = await prisma.user.update({
      where: { identifier: id },
      data: {
        ...userUpdateData,
        isArchived: true,
      },
    });
  } catch (e) {
    res.status(400).json(UserNotFound);
    return;
  }
  //TODO: Add deleting token to ensure user cannot log in again
  res.status(204).json(user);
});

module.exports = router;
