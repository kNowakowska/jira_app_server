const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

const {
  NoReqUser,
  BoardNotFound,
  NoRequiredData,
  BoardNotCreated,
  BoardOrUserNotFound,
} = require("../errors/boards");
const { CannotAssignUser } = require("../errors/tasks");
const { getNextOrderInColumn, getNextTaskNumber } = require("../utils");

router.get("/", async (req, res) => {
  if (!req.user.identifier) return res.status(404).json(NoReqUser);
  const boards = await prisma.board.findMany({
    where: {
      OR: [
        {
          isArchived: false,
          contributors: {
            some: {
              identifier: {
                equals: req.user.identifier,
              },
            },
          },
        },
        {
          isArchived: false,
          owner: {
            identifier: {
              equals: req.user.identifier,
            },
          },
        },
      ],
    },
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
  res.status(200).json(boards);
});

router.get("/contributed", async (req, res) => {
  if (!req.user.identifier) return res.status(404).json(NoReqUser);
  const boards = await prisma.board.findMany({
    where: {
      isArchived: false,
      contributors: {
        some: {
          identifier: {
            equals: req.user.identifier,
          },
        },
      },
    },
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

router.get("/owned", async (req, res) => {
  if (!req.user.identifier) {
    res.status(404).json(NoReqUser);
    return;
  }
  const boards = await prisma.board.findMany({
    where: {
      isArchived: false,
      owner: {
        identifier: {
          equals: req.user.identifier,
        },
      },
    },
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

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const board = await prisma.board.findUnique({
    where: { identifier: id },
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
  if (!board) {
    res.status(404).json(BoardNotFound);
    return;
  }
  res.json(board);
});

router.post("/", async (req, res) => {
  const { name, shortcut } = req.body;
  if (!name || !shortcut) {
    res.status(400).json(NoRequiredData);
    return;
  }
  const board = await prisma.board.create({
    data: {
      name,
      shortcut,
      owner: {
        connect: {
          identifier: req.user.identifier,
        },
      },
    },
  });
  if (!board) {
    res.status(400).json(BoardNotCreated);
    return;
  }
  res.status(201).json(board);
});

router.put("/:id", async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (!name) {
    res.status(400).json(NoRequiredData);
    return;
  }
  let board = null;
  try {
    board = await prisma.board.update({
      where: { identifier: id },
      data: {
        name,
      },
    });
  } catch (e) {
    res.status(400).json(BoardNotFound);
    return;
  }
  res.status(200).json(board);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const boardToDelete = await prisma.board.findUnique({
    where: { identifier: id },
  });
  if (!boardToDelete) {
    res.status(400).json(BoardNotFound);
    return;
  }

  let board = null;
  try {
    board = await prisma.board.update({
      where: { identifier: id },
      data: {
        name: boardToDelete.name,
        shortcut: boardToDelete.shortcut,
        isArchived: true,
      },
    });
  } catch (e) {
    res.status(400).json(BoardNotFound);
    return;
  }
  res.status(204).json(board);
});

router.put("/:id/users/:userId", async (req, res) => {
  const { id, userId } = req.params;
  if (!id || !userId) {
    res.status(400).json(NoRequiredData);
    return;
  }
  let board = null;
  try {
    board = await prisma.board.update({
      where: { identifier: id },
      data: {
        contributors: {
          connect: {
            identifier: userId,
          },
        },
      },
    });
  } catch (e) {
    res.status(400).json(BoardOrUserNotFound);
    return;
  }
  res.status(200).json(board);
});

router.delete("/:id/users/:userId", async (req, res) => {
  const { id, userId } = req.params;
  if (!id || !userId) {
    res.status(400).json(NoRequiredData);
    return;
  }
  let board = null;
  try {
    board = await prisma.board.update({
      where: { identifier: id },
      data: {
        contributors: {
          disconnect: {
            identifier: userId,
          },
        },
      },
    });
  } catch (e) {
    res.status(400).json(BoardOrUserNotFound);
    return;
  }
  res.status(200).json(board);
});

router.get("/:boardId/tasks", async (req, res) => {
  const { boardId } = req.params;
  if (!boardId) {
    res.status(400).json(BoardNotFound);
    return;
  }

  const tasks = await prisma.task.findMany({
    where: {
      isArchived: false,
      board: {
        identifier: boardId,
      },
    },
  });
  res.status(200).json(tasks);
});

router.post("/:boardId/tasks", async (req, res) => {
  const { boardId } = req.params;
  const {
    title,
    description,
    assignedUserIdentifier,
    boardColumn,
    taskPriority,
  } = req.body;

  if (!boardId) {
    res.status(400).json(BoardNotFound);
    return;
  }

  if (!title || !description || !boardColumn || !taskPriority) {
    res.status(400).json(NoRequiredData);
    return;
  }

  const orderInColumn = await getNextOrderInColumn(boardId);
  const taskNumber = await getNextTaskNumber(boardId);

  let task = await prisma.task.create({
    data: {
      title,
      description,
      boardColumn,
      taskPriority,
      creationDate: new Date(),
      taskNumber: taskNumber,
      reporter: {
        connect: {
          identifier: req.user.identifier,
        },
      },
      orderInColumn: orderInColumn,
      board: {
        connect: {
          identifier: boardId,
        },
      },
    },
  });
  if (assignedUserIdentifier) {
    try {
      task = await prisma.task.update({
        where: {
          identifier: task.identifier,
        },
        data: {
          assignedUser: {
            connect: {
              identifier: assignedUserIdentifier,
            },
          },
        },
      });
    } catch (e) {
      res.status(400).json(CannotAssignUser);
      return;
    }
  }
  res.status(200).json(task);
});

module.exports = router;
