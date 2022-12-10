const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateAccessToken = (userData) => {
  return jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn: "86400s" });
};

const checkPassword = async (user, password) => {
  return (
    user && !user.isArchived && bcrypt.compareSync(password, user.password)
  );
};

const getNextOrderInColumn = async (boardId) => {
  const tasks = await prisma.task.findMany({
    where: {
      boardColumn: "TO_DO",
      board: {
        identifier: boardId,
      },
    },
  });
  return tasks.length;
};

const getNextTaskNumber = async (boardId) => {
  const tasks = await prisma.task.findMany({
    where: {
      board: {
        identifier: boardId,
      },
    },
  });
  return `t-${tasks.length < 10 ? "0" + tasks.length : tasks.length}`;
};

module.exports = {
  generateAccessToken,
  checkPassword,
  getNextOrderInColumn,
  getNextTaskNumber,
};
