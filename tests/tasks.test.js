const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4 } = require("uuid");

const endpoint = "tasks";

const user = {
  firstname: "Ron",
  surname: "Weasley",
  email: "ron@xx.pl",
  password: "test",
};

const user2 = {
  firstname: "Hermiona",
  surname: "Granger",
  email: "herm@xx.pl",
  password: "test",
};

const board = { name: "Board 1", shortcut: "b10" };

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

describe("get task by id", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

  const task2 = {
    title: "Task 2",
    description: "Task 2 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId2 = null;

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
    taskId2 = newTask2.identifier;
    await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${taskId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  });

  afterAll(async () => {
    await prisma.task.delete({
      where: { identifier: taskId },
    });
    await prisma.task.delete({
      where: { identifier: taskId2 },
    });
  });
  it("task got successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${taskId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task, identifier: taskId })
    );
  });
  it("task deleted", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${taskId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.reasonCode).toBe("TASK_DELETED");
  });
  it("task not found", async () => {
    const noTaskId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${noTaskId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_NOT_FOUND");
  });
});

describe("update task", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

  const task2 = {
    title: "Task 2",
    description: "Task 2 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId2 = null;

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
    taskId2 = newTask2.identifier;
    await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${taskId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  });

  afterAll(async () => {
    await prisma.task.delete({
      where: { identifier: taskId },
    });
    await prisma.task.delete({
      where: { identifier: taskId2 },
    });
  });
  it("no required data", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${taskId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("task deleted", async () => {
    const newData = { title: "New task" };
    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${taskId2}`)
      .send(newData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.reasonCode).toBe("TASK_DELETED");
  });
  it("task not found", async () => {
    const noTaskId = v4();
    const newData = { title: "New task" };
    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${noTaskId}`)
      .send(newData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_NOT_FOUND");
  });
  it("task update successfully", async () => {
    const newData = { title: "New task" };
    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${taskId}`)
      .send(newData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task, title: "New task" })
    );
  });
});

describe("log time of task", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

  const task2 = {
    title: "Task 2",
    description: "Task 2 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId2 = null;

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
    const newTask2 = await prisma.task.create({
      data: {
        title: task2.title,
        description: task2.description,
        boardColumn: task2.boardColumn,
        taskPriority: task2.taskPriority,
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
    taskId2 = newTask2.identifier;
  });

  afterAll(async () => {
    await prisma.task.delete({
      where: { identifier: taskId },
    });
    await prisma.task.delete({
      where: { identifier: taskId2 },
    });
  });

  it("lack of required data", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId}/log-time`)
      .set("Authorization", `Bearer ${jwtToken}`);
    
    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("action forbidden because requets user isn't assigned to task", async () => {
    const newData = { loggedTime: 10 };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId2}/log-time`)
      .send(newData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("TASK_FORBIDDEN_ACTION");
  });
  it("task not found", async () => {
    const noTaskId = v4();
    const newData = { loggedTime: 10 };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${noTaskId}/log-time`)
      .send(newData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_NOT_FOUND");
  });
  it("time logged successfully", async () => {
    const newData = { loggedTime: 10 };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId}/log-time`)
      .send(newData)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task, loggedTime: 10 })
    );
  });
});

describe("delete assigned user", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

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
  });

  afterAll(async () => {
    await prisma.task.delete({
      where: { identifier: taskId },
    });
  });
  it("task not found", async () => {
    const noTaskId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${noTaskId}/assigned-user`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_NOT_FOUND");
  });
  it("user assignment deleted successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${taskId}/assigned-user`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task, assignedUserId: null })
    );
  });
});

describe("delete task", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

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
  });

  afterAll(async () => {
    await prisma.task.delete({
      where: { identifier: taskId },
    });
  });
  it("task not found", async () => {
    const noTaskId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${noTaskId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_NOT_FOUND");
  });
  it("task deleted successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${taskId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task, isDeleted: true })
    );
  });
});

describe("post a comment to the task", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

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
  });

  afterAll(async () => {
    await prisma.task.delete({
      where: { identifier: taskId },
    });
  });

  it("no required data given", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post(`${endpoint}/${taskId}/comments`)
      .send({})
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("task not found", async () => {
    const data = { content: "Komentarz 1" };
    const noTaskId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .post(`${endpoint}/${noTaskId}/comments`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_NOT_FOUND");
  });
  it("comment created successfully", async () => {
    const data = { content: "Comment 1" };
    const response = await request(process.env.TEST_BASE_URL)
      .post(`${endpoint}/${taskId}/comments`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ content: "Comment 1" })
    );
  });
});

describe("change order of the task", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

  const task2 = {
    title: "Task 2",
    description: "Task 2 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId2 = null;

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
    const newTask2 = await prisma.task.create({
      data: {
        title: task2.title,
        description: task2.description,
        boardColumn: task2.boardColumn,
        taskPriority: task2.taskPriority,
        creationDate: new Date(),
        taskNumber: "t-01",
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
  });

  it("task not found", async () => {
    const data = { positionInColumn: 0 };
    const noTaskId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${noTaskId}/order`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_NOT_FOUND");
  });
  it("no required data given", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId}/order`)
      .send({})
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("from the last to the first position", async () => {
    const data = { positionInColumn: 0 };
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${taskId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task2, orderInColumn: 1 })
    );

    const response2 = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId2}/order`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response2.statusCode).toBe(200);
    expect(response2.body).toEqual(
      expect.objectContaining({ ...task2, orderInColumn: 0 })
    );
  });
  it("from the first to the last position", async () => {
    const data = { positionInColumn: 1 };
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${taskId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task2, orderInColumn: 0 })
    );

    const response2 = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId2}/order`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response2.statusCode).toBe(200);
    expect(response2.body).toEqual(
      expect.objectContaining({ ...task2, orderInColumn: 1 })
    );
  });
  it("to the position that does'n exist", async () => {
    const data = { positionInColumn: 5 };
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${taskId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task, orderInColumn: 0 })
    );

    const response2 = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId}/order`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response2.statusCode).toBe(200);
    expect(response2.body).toEqual(
      expect.objectContaining({ ...task, orderInColumn: 1 })
    );
  });
});

describe("change column and order of the task", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;

  const task2 = {
    title: "Task 2",
    description: "Task 2 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId2 = null;

  const task3 = {
    title: "Task 3",
    description: "Task 3 description",
    boardColumn: "READY_FOR_TESTING",
    taskPriority: "MEDIUM",
  };
  let taskId3 = null;

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
    const newTask2 = await prisma.task.create({
      data: {
        title: task2.title,
        description: task2.description,
        boardColumn: task2.boardColumn,
        taskPriority: task2.taskPriority,
        creationDate: new Date(),
        taskNumber: "t-01",
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
      },
    });
    taskId2 = newTask2.identifier;
    const newTask3 = await prisma.task.create({
      data: {
        title: task3.title,
        description: task3.description,
        boardColumn: task3.boardColumn,
        taskPriority: task3.taskPriority,
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
    taskId3 = newTask3.identifier;
  });

  afterAll(async () => {
    await prisma.task.delete({
      where: { identifier: taskId },
    });
    await prisma.task.delete({
      where: { identifier: taskId2 },
    });
    await prisma.task.delete({
      where: { identifier: taskId3 },
    });
  });

  it("task not found", async () => {
    const data = { positionInColumn: 0, newTaskColumn: "IN_PROGRESS" };
    const noTaskId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${noTaskId}/columns`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_NOT_FOUND");
  });
  it("no required data given", async () => {
    const data = {};
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId}/columns`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("given column does not exist", async () => {
    const data = { positionInColumn: 0, newTaskColumn: "NO_EXISTS" };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId}/columns`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("to the position that does'n exist", async () => {
    const data = { positionInColumn: 5, newTaskColumn: "IN_PROGRESS" };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId}/columns`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        ...task,
        orderInColumn: 0,
        boardColumn: "IN_PROGRESS",
      })
    );
  });
  it("column changed successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${taskId2}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        ...task2,
        orderInColumn: 0,
        boardColumn: "TO_DO",
      })
    );

    const data = { positionInColumn: 0, newTaskColumn: "READY_FOR_TESTING" };
    const response2 = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId2}/columns`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response2.statusCode).toBe(200);
    expect(response2.body).toEqual(
      expect.objectContaining({
        ...task2,
        orderInColumn: 0,
        boardColumn: "READY_FOR_TESTING",
      })
    );
  });
  it("from the last to the first position in another column", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${taskId3}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        ...task3,
        orderInColumn: 1,
        boardColumn: "READY_FOR_TESTING",
      })
    );

    const data = { positionInColumn: 0, newTaskColumn: "READY_FOR_TESTING" };
    const response2 = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId3}/columns`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response2.statusCode).toBe(200);
    expect(response2.body).toEqual(
      expect.objectContaining({
        ...task3,
        orderInColumn: 0,
        boardColumn: "READY_FOR_TESTING",
      })
    );
  });
  it("from the first to the last position in another column", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${taskId3}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        ...task3,
        orderInColumn: 0,
        boardColumn: "READY_FOR_TESTING",
      })
    );

    const data = { positionInColumn: 1, newTaskColumn: "READY_FOR_TESTING" };
    const response2 = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId3}/columns`)
      .send(data)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response2.statusCode).toBe(200);
    expect(response2.body).toEqual(
      expect.objectContaining({
        ...task3,
        orderInColumn: 1,
        boardColumn: "READY_FOR_TESTING",
      })
    );
  });
});

describe("archive task", () => {
  const task = {
    title: "Task 1",
    description: "Task 1 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId = null;
  const task2 = {
    title: "Task 2",
    description: "Task 2 description",
    boardColumn: "TO_DO",
    taskPriority: "MEDIUM",
  };
  let taskId2 = null;

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
    const newTask2 = await prisma.task.create({
      data: {
        title: task2.title,
        description: task2.description,
        boardColumn: task2.boardColumn,
        taskPriority: task2.taskPriority,
        creationDate: new Date(),
        taskNumber: "t-02",
        isDeleted: true,
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
    taskId2 = newTask2.identifier;
  });

  afterAll(async () => {
    await prisma.task.delete({
      where: { identifier: taskId },
    });
    await prisma.task.delete({
      where: { identifier: taskId2 },
    });
  });

  it("task not found", async () => {
    const noTaskId = v4();
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${noTaskId}/archive`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_NOT_FOUND");
  });

  it("task already deleted", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId2}/archive`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("TASK_DELETED");
  });
  it("task archived successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${taskId}/archive`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ ...task, isArchived: true })
    );
  });
});
