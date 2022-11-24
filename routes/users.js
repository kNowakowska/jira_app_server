const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany({
    where: { isArchived: false },
  });
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { identifier: id },
  });
  res.json(user);
});

router.post("/", async (req, res) => {
  const { firstname, surname, email } = req.body;
  //TODO: check if user with given email exists
  //TODO: check if all data given
  const user = await prisma.user.create({
    data: {
      firstname,
      surname,
      email,
      ownedBoards: {},
      createdTasks: {},
      tasks: {},
      contributedBoards: {},
      createdComments: {},
    },
  });
  res.status(201).json(user);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstname, surname, email } = req.body;
  //TODO: check if user with given email exists
  //TODO: check if all data given
  const existingUser = await prisma.user.findUnique({
    where: { identifier: id },
  });
  const user = await prisma.user.update({
    where: { identifier: id },
    data: {
      firstname: firstname || existingUser.firstname,
      surname: surname || existingUser.surname,
      email: email || existingUser.email,
      ownedBoards: {},
      createdTasks: {},
      tasks: {},
      contributedBoards: {},
      createdComments: {},
    },
  });
  res.json(user);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({
    where: { identifier: id },
  });
  res.status(204).json({ identifier: id });
});

module.exports = router;
