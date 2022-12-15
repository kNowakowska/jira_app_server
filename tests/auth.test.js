const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const user = {
  firstname: "Jack",
  surname: "Sparrow",
  email: "jack@xx.pl",
  password: "test",
};

let userId = "";

describe("access token", () => {
  it.todo("401 when no access token");
});

describe("login", () => {
  beforeAll(async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post("users")
      .send(user);
    userId = response.body.identifier;
    console.log(userId);
    // const loginResponse = await request(process.env.TEST_BASE_URL)
    //   .post("auth/login")
    //   .send({ email: user.email, password: user.password });
    // jwtToken = loginResponse.body.accessToken;
  });
  afterAll(async () => {
    console.log(userId);
    await prisma.user.delete({
      where: { identifier: userId },
    });
  });

  it("no required data given", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post("auth/login")
      .send({});
    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });

  it("no user with given email", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post("auth/login")
      .send({ email: "Ann@xx.pl", password: "test" });
    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("USER_NOT_FOUND");
  });

  it("login correctly", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post("auth/login")
      .send({ email: user.email, password: user.password });
    expect(response.statusCode).toBe(200);
    expect(response.body.userIdentifier).toBe(userId);
    expect(response.body.accessToken).toBeDefined();
  });

  it("incorrect password", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post("auth/login")
      .send({ email: "jack@xx.pl", password: "incorrect_test" });
    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("INVALID_EMAIL_OR_PASSWORD");
  });
});

describe("logout", () => {
  it.todo("no required data");
  it.todo("logout successfully");
});
