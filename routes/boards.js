const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const boards = await prisma.board.findMany({
    where: { isArchived: false },
  });
  res.json(boards);
});

router.get("/contributed", async (req, res) => {
  const boards = await prisma.board.findMany({
    where: { isArchived: false },
  });
  res.json(boards);
});

router.get("/owned", async (req, res) => {
  console.log(req);
  const boards = await prisma.board.findMany({
    where: { isArchived: false },
  });
  res.json(boards);
});


module.exports = router;
