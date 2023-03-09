const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4 } = require("uuid");

const endpoint = "boards";

const user = {
  firstname: "Jon",
  surname: "Snow",
  email: "jon@snow.pl",
  password: "test",
};

const user2 = {
  firstname: "Rachel",
  surname: "Green",
  email: "rech@xx.pl",
  password: "test",
};

let userId = "";
let userId2 = "";

let jwtToken = "";
let jwtToken2 = "";

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
});

afterAll(async () => {
  await prisma.user.delete({
    where: { identifier: userId },
  });
  await prisma.user.delete({
    where: { identifier: userId2 },
  });
});

describe("create a new board", () => {
  const board = { name: "Board 1", shortcut: "b01" };
  let boardId = null;

  afterAll(async () => {
    await prisma.board.delete({
      where: { identifier: boardId },
    });
  });

  it("no required data given", async () => {
    const noDataBoard = { name: "Board 1" };
    const response = await request(process.env.TEST_BASE_URL)
      .post(endpoint)
      .send(noDataBoard)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });

  it("create board successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post(endpoint)
      .send(board)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.identifier).toBeDefined();
    boardId = response.body.identifier;
  });
});

describe("get boards", () => {
  const board = { name: "Board 1", shortcut: "b01" };
  const board2 = { name: "Board 2", shortcut: "b02" };

  let boardId = null;
  let boardId2 = null;

  beforeAll(async () => {
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
    const newBoard2 = await prisma.board.create({
      data: {
        ...board2,
        owner: {
          connect: {
            identifier: userId2,
          },
        },
        contributors: {
          connect: {
            identifier: userId,
          },
        },
      },
    });

    boardId2 = newBoard2.identifier;
  });

  afterAll(async () => {
    await prisma.board.delete({
      where: { identifier: boardId },
    });
    await prisma.board.delete({
      where: { identifier: boardId2 },
    });
  });

  it("get all boards successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(endpoint)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...board, identifier: boardId }),
        expect.objectContaining({ ...board2, identifier: boardId2 }),
      ])
    );
  });

  it("get contributed boards", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/contributed`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...board2, identifier: boardId2 }),
      ])
    );
  });

  it("get owned boards", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/owned`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...board, identifier: boardId }),
      ])
    );
  });
});

describe("get board by identifier", () => {
  const board = { name: "Board 1", shortcut: "b01" };
  const board2 = { name: "Board 2", shortcut: "b02" };
  const board3 = { name: "Board 3", shortcut: "b03" };

  let boardId = null;
  let boardId2 = null;
  let boardId3 = null;

  beforeAll(async () => {
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
    const newBoard2 = await prisma.board.create({
      data: {
        ...board2,
        owner: {
          connect: {
            identifier: userId2,
          },
        },
        contributors: {
          connect: {
            identifier: userId,
          },
        },
      },
    });

    boardId2 = newBoard2.identifier;

    const newBoard3 = await prisma.board.create({
      data: {
        ...board3,
        owner: {
          connect: {
            identifier: userId,
          },
        },
      },
    });
    boardId3 = newBoard3.identifier;
    await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${boardId3}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  });

  afterAll(async () => {
    await prisma.board.delete({
      where: { identifier: boardId },
    });
    await prisma.board.delete({
      where: { identifier: boardId2 },
    });
    await prisma.board.delete({
      where: { identifier: boardId3 },
    });
  });

  it("get board successfully if user is the owner", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${boardId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...board, identifier: boardId })
    );
  });

  it("get board successfully if user is the contributor", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${boardId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...board2, identifier: boardId2 })
    );
  });

  it("board doesn't exist", async () => {
    const noBoardId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${noBoardId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.reasonCode).toBe("BOARD_NOT_FOUND");
  });

  it("cannot get board if user is not the owner or contributor", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${boardId}`)
      .set("Authorization", `Bearer ${jwtToken2}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("BOARD_ACTION_FORBIDDEN");
  });

  it("board is already deleted", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${boardId3}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("BOARD_DELETED");
  });
});

describe("update a board", () => {
  let board = { name: "Board 1", shortcut: "b01" };
  const board2 = { name: "Board 2", shortcut: "b02" };
  const board3 = { name: "Board 3", shortcut: "b03" };

  let boardId = null;
  let boardId2 = null;
  let boardId3 = null;
  beforeAll(async () => {
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
    const newBoard2 = await prisma.board.create({
      data: {
        ...board2,
        owner: {
          connect: {
            identifier: userId2,
          },
        },
        contributors: {
          connect: {
            identifier: userId,
          },
        },
      },
    });

    boardId2 = newBoard2.identifier;
    const newBoard3 = await prisma.board.create({
      data: {
        ...board3,
        owner: {
          connect: {
            identifier: userId,
          },
        },
      },
    });
    boardId3 = newBoard3.identifier;
    await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${boardId3}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  });

  afterAll(async () => {
    await prisma.board.delete({
      where: { identifier: boardId },
    });
    await prisma.board.delete({
      where: { identifier: boardId2 },
    });
    await prisma.board.delete({
      where: { identifier: boardId3 },
    });
  });

  it("no required data given", async () => {
    const noDataBoard = { noProp: "Board 1" };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${boardId}`)
      .send(noDataBoard)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("user isn't the owner of the board", async () => {
    const boardData = { name: "New board title" };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${boardId2}`)
      .send(boardData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("BOARD_ACTION_FORBIDDEN");
  });
  it("update board successfully", async () => {
    const boardData = { name: "New board title" };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${boardId}`)
      .send(boardData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining(boardData));
    board = response.body;
  });
  it("board doesn't exist", async () => {
    const noBoardId = v4();
    const boardData = { name: "New board title" };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${noBoardId}`)
      .send(boardData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.reasonCode).toBe("BOARD_NOT_FOUND");
  });

  it("board is already deleted", async () => {
    const boardData = { name: "New board title" };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${boardId3}`)
      .send(boardData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("BOARD_DELETED");
  });
});

describe("delete a board", () => {
  let board = { name: "Board 1", shortcut: "b01" };
  const board2 = { name: "Board 2", shortcut: "b02" };
  const board3 = { name: "Board 3", shortcut: "b03" };

  let boardId = null;
  let boardId2 = null;
  let boardId3 = null;
  beforeAll(async () => {
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
    const newBoard2 = await prisma.board.create({
      data: {
        ...board2,
        owner: {
          connect: {
            identifier: userId2,
          },
        },
        contributors: {
          connect: {
            identifier: userId,
          },
        },
      },
    });

    boardId2 = newBoard2.identifier;
    const newBoard3 = await prisma.board.create({
      data: {
        ...board3,
        owner: {
          connect: {
            identifier: userId,
          },
        },
      },
    });
    boardId3 = newBoard3.identifier;
    await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${boardId3}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  });

  afterAll(async () => {
    await prisma.board.delete({
      where: { identifier: boardId },
    });
    await prisma.board.delete({
      where: { identifier: boardId2 },
    });
    await prisma.board.delete({
      where: { identifier: boardId3 },
    });
  });
  it("board doesn't exist", async () => {
    const noBoardId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${noBoardId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.reasonCode).toBe("BOARD_NOT_FOUND");
  });
  it("user isn't the owner of the board", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${boardId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("BOARD_ACTION_FORBIDDEN");
  });
  it("board deleted successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${boardId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(204);
  });

  it("board is already deleted", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${boardId3}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("BOARD_DELETED");
  });
});

describe("assign user to the board", () => {
  const board = { name: "Board 1", shortcut: "b01" };
  let boardId = null;

  beforeAll(async () => {
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
  });
  it("user isn't the owner of the board", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${boardId}/users/${userId2}`)
      .set("Authorization", `Bearer ${jwtToken2}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("BOARD_ACTION_FORBIDDEN");
  });
  it("user assigned successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${boardId}/users/${userId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining(board));
  });
});

describe("delete assignment of user to the board", () => {
  const board = { name: "Board 1", shortcut: "b01" };
  let boardId = null;

  beforeAll(async () => {
    const newBoard = await prisma.board.create({
      data: {
        ...board,
        owner: {
          connect: {
            identifier: userId,
          },
        },
        contributors: {
          connect: {
            identifier: userId2,
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
  });

  it("user isn't the owner of the board", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${boardId}/users/${userId2}`)
      .set("Authorization", `Bearer ${jwtToken2}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("BOARD_ACTION_FORBIDDEN");
  });
  it("user assignment deleted successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${boardId}/users/${userId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining(board));
  });
});

describe("get board tasks", () => {
  const board = { name: "Board 1", shortcut: "b01" };
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  const task2 = {
    title: "Task 2",
    description: "Task 2 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let boardId = null;
  let taskId = null;
  let taskId2 = null;

  beforeAll(async () => {
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
      },
    });
    taskId = newTask.identifier;
    const newTask2 = await prisma.task.create({
      data: {
        title: task2.title,
        description: task2.description,
        boardColumn: task2.boardColumn,
        taskPriority: task2.taskPriority,
        creationDate: new Date(),
        taskNumber: "t-02",
        reporter: {
          connect: {
            identifier: userId,
          },
        },
        orderInColumn: 1,
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
    taskId2 = newTask2.identifier;
  });

  afterAll(async () => {
    await prisma.task.delete({
      where: { identifier: taskId },
    });
    await prisma.task.delete({
      where: { identifier: taskId2 },
    });
    await prisma.board.delete({
      where: { identifier: boardId },
    });
  });
  it("get tasks successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${boardId}/tasks`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...task, identifier: taskId }),
        expect.objectContaining({
          ...task2,
          identifier: taskId2,
          assignedUserId: userId,
        }),
      ])
    );
  });
  it("board not found", async () => {
    const noBoardId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${noBoardId}/tasks`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("BOARD_NOT_FOUND");
  });
  it("user isn't the owner or contributor of the board", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${boardId}/tasks`)
      .set("Authorization", `Bearer ${jwtToken2}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("BOARD_ACTION_FORBIDDEN");
  });
  it("filtering using assigned user", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(
        `${endpoint}/${boardId}/tasks?search=&assignedUserIdentifier=${userId}`
      )
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...task2,
          identifier: taskId2,
          assignedUserId: userId,
        }),
      ])
    );
  });
  it("filtering using task number", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${boardId}/tasks?search=t-01&assignedUserIdentifier=`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...task, identifier: taskId }),
      ])
    );
  });
});

describe("create task", () => {
  const board = { name: "Board 1", shortcut: "b01" };
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let boardId = null;

  beforeAll(async () => {
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
  });

  it("no required data", async () => {
    const taskData = { name1: "Name 1" };
    const response = await request(process.env.TEST_BASE_URL)
      .post(`${endpoint}/${boardId}/tasks`)
      .send(taskData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("board not found", async () => {
    const noBoardId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .post(`${endpoint}/${noBoardId}/tasks`)
      .send(task)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("BOARD_NOT_FOUND");
  });
  it("user isn't the owner or contributor of the board", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post(`${endpoint}/${boardId}/tasks`)
      .send(task)
      .set("Authorization", `Bearer ${jwtToken2}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("BOARD_ACTION_FORBIDDEN");
  });
  it("create task successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post(`${endpoint}/${boardId}/tasks`)
      .send(task)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining(task));
  });
  it("create task successfully with assigned user", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post(`${endpoint}/${boardId}/tasks`)
      .send({ ...task, assignedUserIdentifier: userId })
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task, assignedUserId: userId })
    );
  });
});
