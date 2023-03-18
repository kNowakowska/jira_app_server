const { PrismaClient } = require("@prisma/client");
const express = require("express");

const prisma = new PrismaClient();
const router = express.Router();

const {
  CommentNotCreated,
  NoRequiredCommentData,
} = require("../errors/comments");
const {
  TaskNotFound,
  NoRequiredData,
  TaskDeleted,
  TaskUpdateError,
  TaskForbiddenAction,
  TaskNotUpdated,
} = require("../errors/tasks");
const { BOARD_COLUMNS } = require("../types");

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const task = await prisma.task.findUnique({
    where: { identifier: id },
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
      comments: {
        select: {
          identifier: true,
          content: true,
          createdDate: true,
          creator: {
            select: {
              identifier: true,
              email: true,
              firstname: true,
              surname: true,
            },
          },
        },
        where: {
          isArchived: false,
        },
      },
    },
  });
  if (!task) {
    res.status(400).json(TaskNotFound);
    return;
  }
  if (task.isArchived) {
    res.status(404).json(TaskDeleted);
    return;
  }
  res.json(task);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, taskPriority, assignedUserIdentifier } = req.body;
  if (!title && !description && !taskPriority && !assignedUserIdentifier) {
    res.status(400).json(NoRequiredData);
    return;
  }

  const updateTask = await prisma.task.findUnique({
    where: {
      identifier: id,
    },
  });

  if (!updateTask) {
    res.status(400).json(TaskNotFound);
    return;
  }

  if (updateTask.isArchived) {
    res.status(404).json(TaskDeleted);
    return;
  }

  const data = {
    title: title || updateTask.title,
    description: description || updateTask.description,
    taskPriority: taskPriority || updateTask.taskPriority,
  };

  if (assignedUserIdentifier) {
    data["assignedUser"] = {
      connect: {
        identifier: assignedUserIdentifier,
      },
    };
  }

  let task = null;
  try {
    task = await prisma.task.update({
      where: { identifier: id },
      data: data,
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
        comments: {
          select: {
            identifier: true,
            content: true,
            createdDate: true,
            creator: {
              select: {
                identifier: true,
                email: true,
                firstname: true,
                surname: true,
              },
            },
          },
          where: {
            isArchived: false,
          },
        },
      },
    });
  } catch (e) {
    res.status(400).json(TaskUpdateError);
    return;
  }

  res.json(task);
});

router.put("/:id/log-time", async (req, res) => {
  const { id } = req.params;
  const { loggedTime } = req.body;

  if (!loggedTime) {
    res.status(400).json(NoRequiredData);
    return;
  }

  const taskToUpdate = await prisma.task.findUnique({
    where: {
      identifier: id,
    },
  });

  if (!taskToUpdate) {
    res.status(400).json(TaskNotFound);
    return;
  }

  if (req.user.identifier !== taskToUpdate.assignedUserId) {
    res.status(403).json(TaskForbiddenAction);
    return;
  }

  let task = null;
  try {
    task = await prisma.task.update({
      where: { identifier: id },
      data: {
        loggedTime: loggedTime,
      },
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
        comments: {
          select: {
            identifier: true,
            content: true,
            createdDate: true,
            creator: {
              select: {
                identifier: true,
                email: true,
                firstname: true,
                surname: true,
              },
            },
          },
          where: {
            isArchived: false,
          },
        },
      },
    });
  } catch (e) {
    res.status(400).json(TaskUpdateError);
    return;
  }
  res.json(task);
});

router.delete("/:id/assigned-user", async (req, res) => {
  const { id } = req.params;
  let task = null;
  try {
    task = await prisma.task.update({
      where: { identifier: id },
      data: {
        assignedUser: {
          disconnect: true,
        },
      },
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
        comments: {
          select: {
            identifier: true,
            content: true,
            createdDate: true,
            creator: {
              select: {
                identifier: true,
                email: true,
                firstname: true,
                surname: true,
              },
            },
          },
          where: {
            isArchived: false,
          },
        },
      },
    });
  } catch (e) {
    res.status(400).json(TaskNotFound);
    return;
  }

  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let task = null;
  try {
    task = await prisma.task.update({
      where: { identifier: id },
      data: {
        isArchived: true,
      },
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
        comments: {
          select: {
            identifier: true,
            content: true,
            createdDate: true,
            creator: {
              select: {
                identifier: true,
                email: true,
                firstname: true,
                surname: true,
              },
            },
          },
          where: {
            isArchived: false,
          },
        },
      },
    });
  } catch (e) {
    res.status(400).json(TaskNotFound);
    return;
  }

  res.json(task);
});

router.post("/:taskId/comments", async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;
  if (!content) {
    res.status(400).json(NoRequiredCommentData);
    return;
  }

  const taskToUpdate = await prisma.task.findUnique({
    where: {
      identifier: taskId,
    },
  });

  if (!taskToUpdate) {
    res.status(400).json(TaskNotFound);
    return;
  }

  let comment = null;
  try {
    comment = await prisma.comment.create({
      data: {
        content: content,
        creator: {
          connect: {
            identifier: req.user.identifier,
          },
        },
        task: {
          connect: {
            identifier: taskId,
          },
        },
        createdDate: new Date(),
      },
      select: {
        identifier: true,
        content: true,
        createdDate: true,
        creator: {
          select: {
            identifier: true,
            email: true,
            firstname: true,
            surname: true,
          },
        },
      },
    });
  } catch (e) {
    res.status(404).json(CommentNotCreated);
    return;
  }
  res.json(comment);
});

router.put("/:taskId/order", async (req, res) => {
  const { taskId } = req.params;
  const { positionInColumn } = req.body;
  if (positionInColumn === undefined) {
    res.status(400).json(NoRequiredData);
    return;
  }
  const task = await prisma.task.findUnique({
    where: {
      identifier: taskId,
    },
  });

  if (!task) {
    res.status(400).json(TaskNotFound);
    return;
  }

  const tasksInColumn = await prisma.task.findMany({
    where: {
      boardColumn: task.boardColumn,
      boardId: task.boardId,
    },
  });

  if (tasksInColumn.length === 1) {
    let taskUpdated = null;
    try {
      taskUpdated = await prisma.task.update({
        where: {
          identifier: taskId,
        },
        data: {
          ...task,
          orderInColumn: 0,
        },
      });
    } catch (e) {
      res.status(400).json(TaskNotUpdated);
      return;
    }
    res.json(taskUpdated);
    return;
  } else {
    let taskUpdated = null;
    const tasksToUpdate = tasksInColumn.filter(
      (item) => item.identifier !== task.identifier
    );
    tasksToUpdate.splice(positionInColumn, 0, task);

    for (const item of tasksToUpdate) {
      let updatedTask = null;
      try {
        updatedTask = await prisma.task.update({
          where: {
            identifier: item.identifier,
          },
          data: {
            ...item,
            orderInColumn: tasksToUpdate.findIndex(
              (elem) => elem.identifier === item.identifier
            ),
          },
        });
      } catch (e) {
        res.status(400).json(TaskNotUpdated);
        return;
      }
      if (item.identifier === task.identifier) {
        taskUpdated = updatedTask;
      }
    }
    res.json(taskUpdated);
    return;
  }
});

router.put("/:taskId/columns", async (req, res) => {
  const { taskId } = req.params;
  const { positionInColumn, newTaskColumn } = req.body;
  if (
    positionInColumn === undefined ||
    !newTaskColumn ||
    !BOARD_COLUMNS.includes(newTaskColumn)
  ) {
    res.status(400).json(NoRequiredData);
    return;
  }
  const task = await prisma.task.findUnique({
    where: {
      identifier: taskId,
    },
  });

  if (!task) {
    res.status(400).json(TaskNotFound);
    return;
  }

  const tasksInNewColumn = await prisma.task.findMany({
    where: {
      boardColumn: newTaskColumn,
      boardId: task.boardId,
    },
  });

  const tasksInOldColumn = await prisma.task.findMany({
    where: {
      boardColumn: task.boardColumn,
      boardId: task.boardId,
    },
  });

  if (tasksInOldColumn.length > 1) {
    tasksInOldColumn.splice(task.positionInColumn, 1);
    for (const item of tasksInOldColumn) {
      try {
        const updatedTask = await prisma.task.update({
          where: {
            identifier: item.identifier,
          },
          data: {
            ...item,
            orderInColumn: tasksInOldColumn.findIndex(
              (elem) => elem.identifier === item.identifier
            ),
          },
        });
      } catch (e) {
        res.status(400).json(TaskNotUpdated);
        return;
      }
    }
  }
  if (tasksInNewColumn.length === 0) {
    let taskUpdated = null;
    try {
      taskUpdated = await prisma.task.update({
        where: {
          identifier: taskId,
        },
        data: {
          ...task,
          orderInColumn: 0,
          boardColumn: newTaskColumn,
        },
      });
    } catch (e) {
      res.status(400).json(TaskNotUpdated);
      return;
    }
    res.json(taskUpdated);
    return;
  } else {
    let taskUpdated = null;
    tasksInNewColumn.splice(positionInColumn, 0, task);

    for (const item of tasksInNewColumn) {
      let updatedTask = null;
      try {
        updatedTask = await prisma.task.update({
          where: {
            identifier: item.identifier,
          },
          data: {
            ...item,
            orderInColumn: tasksInNewColumn.findIndex(
              (elem) => elem.identifier === item.identifier
            ),
            boardColumn:
              item.identifier === taskId ? newTaskColumn : item.boardColumn,
          },
        });
      } catch (e) {
        res.status(400).json(TaskNotUpdated);
        return;
      }
      if (item.identifier === task.identifier) {
        taskUpdated = updatedTask;
      }
    }
    res.json(taskUpdated);
    return;
  }
});

module.exports = router;
