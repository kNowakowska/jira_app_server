const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const posts = await prisma.user.findMany({
    where: { isArchived: false },
  });
  res.json(posts);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const post = await prisma.user.findUnique({
    where: { isArchived: false, identifier: id },
  });
  res.json(post);
});

router.post("/", async (req, res) => {
  console.log(req.body);
  const { firstname, surname, email } = req.body;
  const post = await prisma.user.create({
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
  res.json(post);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const post = await prisma.user.update({
    where: { identifier: id },
    data: req.body,
  });
  res.json(post);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const post = await prisma.user.delete({
    where: { identifier: id },
  });
});

module.exports = router;
