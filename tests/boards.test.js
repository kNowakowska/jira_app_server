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

const board = { name: "Board 1", shortcut: "b01" };
const board2 = { name: "Board 2", shortcut: "b02" };

let userId = "";
let userId2 = "";
let boardId = "";
let boardId2 = "";

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

  const response3 = await request(process.env.TEST_BASE_URL)
    .post(endpoint)
    .send(board2)
    .set("Authorization", `Bearer ${jwtToken2}`);
  boardId2 = response3.body.identifier;

  const response4 = await request(process.env.TEST_BASE_URL)
    .put(`${endpoint}/${boardId2}/users/${userId}`)
    .set("Authorization", `Bearer ${jwtToken2}`);
});

afterAll(async () => {
  await prisma.board.delete({
    where: { identifier: boardId },
  });
  await prisma.board.delete({
    where: { identifier: boardId2 },
  });
  await prisma.user.delete({
    where: { identifier: userId },
  });
  await prisma.user.delete({
    where: { identifier: userId2 },
  });
});

describe("create a new board", () => {
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
});

describe("update a board", () => {
  it("no required data given", async () => {
    const noDataBoard = { noProp: "Board 1" };
    const response = await request(process.env.TEST_BASE_URL)
      .put(`${endpoint}/${boardId}`)
      .send(noDataBoard)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it.todo("user isn't the owner of the board");
  it.todo("update board successfully");
  it.todo("board is already deleted");
  it.todo("board doesn't exist");
});

describe("delete a board", () => {
  it.todo("board doesn't exist");
  it.todo("board is already deleted");
  it.todo("user isn't the owner of the board");
  it.todo("board deleted successfully");
});

describe("assign user to the board", () => {
  it.todo("no required data given");
  it.todo("user isn't the owner of the board");
  it.todo("user assigned successfully");
});

describe("delete assignment of user to the board", () => {
  it.todo("no required data given");
  it.todo("user isn't the owner of the board");
  it.todo("user assigned successfully");
});

describe("get board tasks", () => {
  it.todo("get tasks successfully");
  it.todo("board not found");
  it.todo("user isn't the owner or contributor of the board");
});

describe("create task", () => {
  it.todo("create task successfully");
  it.todo("board not found");
  it.todo("user isn't the owner or contributor of the board");
});
