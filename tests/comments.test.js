const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4 } = require("uuid");

const endpoint = "comments";

const user = {
  firstname: "Alex",
  surname: "Karev",
  email: "alex@xx.pl",
  password: "test",
};

const user2 = {
  firstname: "Meredith",
  surname: "Grey",
  email: "mer@xx.pl",
  password: "test",
};

const board = { name: "Board 10", shortcut: "b90" };

let userId = "";
let userId2 = "";

let jwtToken = "";
let jwtToken2 = "";

let boardId = "";

beforeAll(async () => {
  const response = await request(process.env.TEST_BASE_URL)
    .post("users")
    .send(user);

  userId = response.body.identifier;

  const loginResponse = await request(process.env.TEST_BASE_URL)
    .post("auth/login")
    .send({ email: user.email, password: user.password });

  jwtToken = loginResponse.body.accessToken;

  const response2 = await request(process.env.TEST_BASE_URL)
    .post("users")
    .send(user2);

  userId2 = response2.body.identifier;

  const loginResponse2 = await request(process.env.TEST_BASE_URL)
    .post("auth/login")
    .send({ email: user2.email, password: user2.password });

  jwtToken2 = loginResponse2.body.accessToken;

  const newBoard = await prisma.board.create({
    data: {
      ...board,
      owner: {
        connect: {
          identifier: userId,
        },
      },
    },
  });

  boardId = newBoard.identifier;
});

afterAll(async () => {
  await prisma.board.delete({
    where: { identifier: boardId },
  });
  await prisma.user.delete({
    where: { identifier: userId },
  });
  await prisma.user.delete({
    where: { identifier: userId2 },
  });
});

describe("update comment", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

  const comment = {
    content: "Comment 1",
  };

  let commentId = null;
  const comment2 = {
    content: "Comment 2",
  };

  let commentId2 = null;
  const comment3 = {
    content: "Comment 3",
  };

  let commentId3 = null;

  beforeAll(async () => {
    const newTask = await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        boardColumn: task.boardColumn,
        taskPriority: task.taskPriority,
        creationDate: new Date(),
        taskNumber: "t-01",
        reporter: {
          connect: {
            identifier: userId,
          },
        },
        orderInColumn: 0,
        board: {
          connect: {
            identifier: boardId,
          },
        },
        assignedUser: {
          connect: {
            identifier: userId,
          },
        },
      },
    });
    taskId = newTask.identifier;

    const newComment = await prisma.comment.create({
      data: {
        content: comment.content,
        creator: {
          connect: {
            identifier: userId,
          },
        },
        task: {
          connect: {
            identifier: taskId,
          },
        },
        createdDate: new Date(),
      },
    });
    commentId = newComment.identifier;
    const newComment2 = await prisma.comment.create({
      data: {
        content: comment2.content,
        creator: {
          connect: {
            identifier: userId,
          },
        },
        task: {
          connect: {
            identifier: taskId,
          },
        },
        createdDate: new Date(),
        isArchived: true,
      },
    });
    commentId2 = newComment2.identifier;
    const newComment3 = await prisma.comment.create({
      data: {
        content: comment3.content,
        creator: {
          connect: {
            identifier: userId2,
          },
        },
        task: {
          connect: {
            identifier: taskId,
          },
        },
        createdDate: new Date(),
      },
    });
    commentId3 = newComment3.identifier;
  });

  afterAll(async () => {
    await prisma.comment.delete({
      where: { identifier: commentId },
    });
    await prisma.task.delete({
      where: { identifier: taskId },
    });
  });

  it("error when no required data", async () => {
    const data = {};
    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${commentId}`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("comment not found", async () => {
    const data = { content: "New comment" };
    const noCommentId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${noCommentId}`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("COMMENT_NOT_FOUND");
  });
  it("comment already deleted", async () => {
    const data = { content: "New comment" };
    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${commentId2}`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("COMMENT_ALREADY_DELETED");
  });
  it("cannot edit comment if not its author", async () => {
    const data = { content: "New comment" };
    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${commentId3}`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("FORBIDDEN_ACTION");
  });
  it("edit comment successfully", async () => {
    const data = { content: "New comment" };
    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${commentId}`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ ...data }));
  });
});

describe("delete comment", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

  const comment = {
    content: "Comment 1",
  };

  let commentId = null;
  const comment2 = {
    content: "Comment 2",
  };

  let commentId2 = null;
  const comment3 = {
    content: "Comment 3",
  };

  let commentId3 = null;

  beforeAll(async () => {
    const newTask = await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        boardColumn: task.boardColumn,
        taskPriority: task.taskPriority,
        creationDate: new Date(),
        taskNumber: "t-01",
        reporter: {
          connect: {
            identifier: userId,
          },
        },
        orderInColumn: 0,
        board: {
          connect: {
            identifier: boardId,
          },
        },
        assignedUser: {
          connect: {
            identifier: userId,
          },
        },
      },
    });
    taskId = newTask.identifier;

    const newComment = await prisma.comment.create({
      data: {
        content: comment.content,
        creator: {
          connect: {
            identifier: userId,
          },
        },
        task: {
          connect: {
            identifier: taskId,
          },
        },
        createdDate: new Date(),
      },
    });
    commentId = newComment.identifier;
    const newComment2 = await prisma.comment.create({
      data: {
        content: comment2.content,
        creator: {
          connect: {
            identifier: userId,
          },
        },
        task: {
          connect: {
            identifier: taskId,
          },
        },
        createdDate: new Date(),
        isArchived: true,
      },
    });
    commentId2 = newComment2.identifier;
    const newComment3 = await prisma.comment.create({
      data: {
        content: comment3.content,
        creator: {
          connect: {
            identifier: userId2,
          },
        },
        task: {
          connect: {
            identifier: taskId,
          },
        },
        createdDate: new Date(),
      },
    });
    commentId3 = newComment3.identifier;
  });

  afterAll(async () => {
    await prisma.comment.delete({
      where: { identifier: commentId },
    });
    await prisma.task.delete({
      where: { identifier: taskId },
    });
  });
  it("comment not found", async () => {
    const noCommentId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${noCommentId}`)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("COMMENT_NOT_FOUND");
  });
  it("comment already deleted", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${commentId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("COMMENT_ALREADY_DELETED");
  });
  it("cannot delete comment if not its author", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${commentId3}`)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("FORBIDDEN_ACTION");
  });
  it("delete comment successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${commentId}`)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ identifier: commentId })
    );
  });
});
