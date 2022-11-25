const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const isAuthenticated = (req, res, next) => {
  if (req.method === "POST" && req.path === "/users") {
    next();
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, payload) => {
    console.error(err);

    if (err) return res.sendStatus(403);

    const user = await prisma.user.findUnique({
      where: { identifier: payload.identifier },
      select: {
        firstname: true,
        surname: true,
        email: true,
        identifier: true,
      },
    });

    req.user = user;
    next();
  });
};

module.exports = { isAuthenticated };
