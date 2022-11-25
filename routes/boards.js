const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const boards = await prisma.board.findMany({
    where: { isArchived: false },
    include: {
      contributors: {
        select: {
          firstname: true,
          surname: true,
          email: true,
          identifier: true,
        },
      },
      owner: {
        select: {
          firstname: true,
          surname: true,
          email: true,
          identifier: true,
        },
      },
      tasks: true,
    },
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
  req;
  const boards = await prisma.board.findMany({
    where: { isArchived: false },
  });
  res.json(boards);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const board = await prisma.board.findUnique({
    where: { identifier: id },
  });
  res.json(board);
});

router.post("/", async (req, res) => {
  const { name, shortcut } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const payload = jwt.decode(token);

  const board = await prisma.board.create({
    data: {
      name,
      shortcut,
      owner: {
        connect: {
          identifier: payload.identifier,
        },
      },
    },
  });
  res.status(201).json(board);
});

router.put("/:id", async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  const board = await prisma.board.update({
    where: { identifier: id },
    data: {
      name,
      shortcut,
    },
  });
  res.status(200).json(board);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const boardToDelete = await prisma.board.findUnique({
    where: { identifier: id },
  });

  const board = await prisma.board.update({
    where: { identifier: id },
    data: {
      name: boardToDelete.name,
      shortcut: boardToDelete.shortcut,
      isArchived: true,
    },
  });
  res.status(204).json(board);
});

router.put("/:id/users/:userId", async (req, res) => {
  const { id, userId } = req.params;

  const board = await prisma.board.update({
    where: { identifier: id },
    data: {
      contributors: {
        connect: {
          identifier: userId,
        },
      },
    },
  });
  res.status(200).json(board);
});

router.delete("/:id/users/:userId", async (req, res) => {
  const { id, userId } = req.params;

  const board = await prisma.board.update({
    where: { identifier: id },
    data: {
      contributors: {
        disconnect: {
          identifier: userId,
        },
      },
    },
  });
  res.status(200).json(board);
});

module.exports = router;
