const { PrismaClient } = require("@prisma/client");
const express = require("express");

const prisma = new PrismaClient();
const router = express.Router();

const {
  CommentNotCreated,
  NoRequiredCommentData,
} = require("../errors/comments");
const { TaskNotFound, NoRequiredData } = require("../errors/tasks");

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const task = await prisma.task.findFirst({
    where: { identifier: id, isArchived: false },
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
  if (task) res.json(task);
  else {
    res.status(400).json(TaskNotFound);
    return;
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, taskPriority, assignedUserIdentifier } = req.body;
  const updateTask = await prisma.task.findUnique({
    where: {
      identifier: id,
    },
  });
  if (!updateTask || updateTask.isArchived) {
    res.status(400).json(TaskNotFound);
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
            creationDate: true,
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
  if (task) res.json(task);
  else {
    res.status(400).json(TaskNotFound);
    return;
  }
});

router.put("/:id/log-time", async (req, res) => {
  const { id } = req.params;
  const { loggedTime } = req.body;
  if (!loggedTime) {
    res.status(400).json(NoRequiredData);
    return;
  }

  const task = await prisma.task.update({
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
          creationDate: true,
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
  if (task) res.json(task);
  else {
    res.status(400).json(TaskNotFound);
    return;
  }
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
            creationDate: true,
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

  if (task) res.json(task);
  else {
    res.status(400).json(TaskNotFound);
    return;
  }
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
            creationDate: true,
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

  if (task) res.json(task);
  else {
    res.status(400).json(TaskNotFound);
    return;
  }
});

router.post("/:taskId/comments", async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;
  if (!content) {
    res.status(400).json(NoRequiredCommentData);
  }

  const comment = await prisma.comment.create({
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
  if (!comment) {
    res.status(404).json(CommentNotCreated);
    return;
  }
  res.json(comment);
});

module.exports = router;
