const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const endpoint = "boards";

const user = {
  firstname: "Jon",
  surname: "Snow",
  email: "jon@snow.pl",
  password: "test",
};

let userId = "";
let boardId = "";

let jwtToken = "";

beforeAll(async () => {
  const response = await request(process.env.TEST_BASE_URL)
    .post("users")
    .send(user);

  userId = response.body.identifier;

  const loginResponse = await request(process.env.TEST_BASE_URL)
    .post("auth/login")
    .send({ email: user.email, password: user.password });

  jwtToken = loginResponse.body.accessToken;
});

afterAll(async () => {
  await prisma.user.delete({
    where: { identifier: userId },
  });
});

describe("create a new board", () => {
  it("no required data given", async () => {
    const board = { name: "Board 1" };
    const response = await request(process.env.TEST_BASE_URL)
      .post(endpoint)
      .send(board)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });
  it("create board successfully", async () => {
    const board = { name: "Board 1", shortcut: "b01" };
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
  it.todo("get all boards successfully");
  it.todo("get contributed boards");
  it.todo("get owned boards");
});

describe("get board by identifier", () => {
  it.todo("get board successfully if user is the owner");
  it.todo("cannot get board if user is not the owner or contributor");
  it.todo("get board successfully if user is the contributor");
  it.todo("board doesn't exist");
  it.todo("board is already deleted");
});

describe("update a board", () => {
  it.todo("no required data given");
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
