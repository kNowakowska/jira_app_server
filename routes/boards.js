const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

const {
  NoReqUser,
  BoardNotFound,
  NoRequiredData,
  BoardNotCreated,
  BoardNotUpdated,
  BoardDeleted,
  BoardNotDeleted,
  BoardActionForbidden,
  BoardAlreadyExists,
} = require("../errors/boards");
const { CannotAssignUser, TaskNotCreated } = require("../errors/tasks");
const { getNextOrderInColumn, getNextTaskNumber } = require("../utils");

const errorIfNotContributorOrOwner = async (res, userId, boardId) => {
  const board = await prisma.board.findUnique({
    where: {
      identifier: boardId,
    },
    include: {
      contributors: true,
    },
  });

  if (!board) {
    res.status(400).json(BoardNotFound);
    return;
  }

  if (board.isArchived) {
    res.status(400).json(BoardDeleted);
    return;
  }

  if (
    userId !== board.ownerId &&
    !board.contributors.map((user) => user.identifier).includes(userId)
  ) {
    res.status(403).json(BoardActionForbidden);
    return;
  }
  return;
};

const errorIfNotOwner = async (userId, boardId) => {
  const boardToUpdate = await prisma.board.findUnique({
    where: {
      identifier: boardId,
    },
  });
  if (userId !== boardToUpdate.ownerId) {
    res.status(403).json(BoardActionForbidden);
    return;
  }
};

router.get("/", async (req, res) => {
  if (!req.user.identifier) {
    res.status(404).json(NoReqUser);
    return;
  }
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
      tasks: {
        include: {
          assignedUser: {
            select: {
              firstname: true,
              surname: true,
              email: true,
              identifier: true,
            },
          },
          reporter: {
            select: {
              firstname: true,
              surname: true,
              email: true,
              identifier: true,
            },
          },
        },
      },
    },
  });
  res.status(200).json(boards);
});

router.get("/contributed", async (req, res) => {
  if (!req.user.identifier) {
    res.status(404).json(NoReqUser);
    return;
  }
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
      tasks: {
        include: {
          assignedUser: {
            select: {
              firstname: true,
              surname: true,
              email: true,
              identifier: true,
            },
          },
          reporter: {
            select: {
              firstname: true,
              surname: true,
              email: true,
              identifier: true,
            },
          },
        },
      },
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
      tasks: {
        include: {
          assignedUser: {
            select: {
              firstname: true,
              surname: true,
              email: true,
              identifier: true,
            },
          },
          reporter: {
            select: {
              firstname: true,
              surname: true,
              email: true,
              identifier: true,
            },
          },
        },
      },
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

  if (board.isArchived) {
    res.status(400).json(BoardDeleted);
    return;
  }
  
  await errorIfNotContributorOrOwner(res, req.user.identifier, id);

  res.json(board);
});

router.post("/", async (req, res) => {
  const { name, shortcut } = req.body;
  if (!name || !shortcut) {
    res.status(400).json(NoRequiredData);
    return;
  }
  const boardByShortcut = await prisma.board.findUnique({
    where: {
      shortcut: shortcut,
    },
  });

  if (boardByShortcut) {
    res.status(400).json(BoardAlreadyExists);
    return;
  }
  let board = null;
  try {
    board = await prisma.board.create({
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
  } catch (e) {
    res.status(400).json(BoardNotCreated);
    return;
  }
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

  await errorIfNotOwner(req.user.identifier, id);
  let board = null;
  try {
    board = await prisma.board.update({
      where: { identifier: id },
      data: {
        name,
      },
    });
  } catch (e) {
    res.status(400).json(BoardNotUpdated);
    return;
  }
  if (board.isArchived) {
    res.status(400).json(BoardDeleted);
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
  if (boardToDelete.isArchived) {
    res.status(400).json(BoardDeleted);
    return;
  }
  await errorIfNotOwner(req.user.identifier, id);

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
    res.status(400).json(BoardNotDeleted);
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
  await errorIfNotOwner(req.user.identifier, id);

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
    res.status(400).json(BoardNotUpdated);
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

  await errorIfNotOwner(req.user.identifier, id);

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
    res.status(400).json(BoardNotUpdated);
    return;
  }
  res.status(200).json(board);
});

router.get("/:boardId/tasks", async (req, res) => {
  const { boardId } = req.params;
  const { search, assignedUserIdentifier } = req.query;

  if (!boardId) {
    res.status(400).json(BoardNotFound);
    return;
  }

  await errorIfNotContributorOrOwner(res, req.user.identifier, boardId);

  const filters = {
    isArchived: false,
    board: {
      identifier: boardId,
    },
  };
  if (search) {
    filters["taskNumber"] = {
      equals: search,
    };
  }

  if (assignedUserIdentifier) {
    filters["assignedUser"] = {
      identifier: assignedUserIdentifier,
    };
  }

  const tasks = await prisma.task.findMany({
    where: filters,
    include: {
      assignedUser: {
        select: {
          identifier: true,
          email: true,
          firstname: true,
          surname: true,
        },
      },
      reporter: {
        select: {
          identifier: true,
          email: true,
          firstname: true,
          surname: true,
        },
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
  await errorIfNotContributorOrOwner(res, req.user.identifier, boardId);

  if (!title || !description || !boardColumn || !taskPriority) {
    res.status(400).json(NoRequiredData);
    return;
  }

  const orderInColumn = await getNextOrderInColumn(boardId);
  const taskNumber = await getNextTaskNumber(boardId);
  let task = null;
  try {
    task = await prisma.task.create({
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
  } catch (e) {
    res.status(400).json(TaskNotCreated);
    return;
  }
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
