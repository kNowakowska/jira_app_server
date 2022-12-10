const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const isAuthenticated = (req, res, next) => {
  if (
    (req.method === "OPTIONS" || req.method === "POST") &&
    req.originalUrl === "/users"
  ) {
    next();
  } else {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null)
      return res.status(401).json({
        reasonCode: "USER IS NOT AUTHORIZED!",
        message: "You need to log in to use the app!",
      });
    else
      jwt.verify(token, process.env.TOKEN_SECRET, async (err, payload) => {
        console.error(err);

        if (err)
          return res.status(401).json({
            reasonCode: "USER IS NOT AUTHORIZED!",
            message: "You need to log in to use the app",
          });

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
  }
};

const noCacheValues = (req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  next();
};

module.exports = { isAuthenticated, noCacheValues };
