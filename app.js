var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var usersRouter = require("./routes/users");
var boardsRouter = require("./routes/boards");
var authRouter = require("./routes/auth");
const taskRouter = require("./routes/tasks");
const commentRouter = require("./routes/comments");

const cors = require("cors");

var livereload = require("livereload");
var connectLiveReload = require("connect-livereload");

const { isAuthenticated, noCacheValues } = require("./middleware/authenticate");

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());

app.use(connectLiveReload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(noCacheValues);
app.use(
  ["/auth/logout", "/boards", "/tasks", "/users", "/comments"],
  isAuthenticated
);
app.use("/users", usersRouter);
app.use("/boards", boardsRouter);
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);
app.use("/comments", commentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
