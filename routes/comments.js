const { PrismaClient } = require("@prisma/client");
const express = require("express");
const prisma = new PrismaClient();
const router = express.Router();

const {
  NoRequiredCommentData,
  CommentNotFound,
} = require("../errors/comments");

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) {
    res.status(400).json(NoRequiredCommentData);
  }
  const commentToUpdate = await prisma.comment.findUnique({
    where: {
      identifier: id,
    },
  });
  if (!commentToUpdate) {
    res.status(400).json(CommentNotFound);
  }
  if (
    req.user.identifier !== commentToUpdate.creatorId ||
    commentToUpdate.isArchived
  ) {
    res.status(403).json(ForbiddenAction);
  }

  const comment = await prisma.comment.update({
    where: {
      identifier: id,
    },
    data: {
      content: content,
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

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const commentToUpdate = await prisma.comment.findUnique({
    where: {
      identifier: id,
    },
  });
  if (
    req.user.identifier !== commentToUpdate.creatorId ||
    commentToUpdate.isArchived
  ) {
    res.status(403).json(ForbiddenAction);
  }

  const comment = await prisma.comment.update({
    where: {
      identifier: id,
    },
    data: {
      isArchived: true,
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
