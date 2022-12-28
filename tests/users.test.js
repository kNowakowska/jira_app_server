const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const endpoint = "users";

const user = {
  firstname: "Harry",
  surname: "Potter",
  email: "harry@xx.pl",
  password: "test",
};

const user2 = {
  firstname: "Mr",
  surname: "Robot",
  email: "mrRobot@xx.pl",
  password: "test",
};

let userId = "";
let userId2 = "";
let jwtToken = "";

beforeAll(async () => {
  const response = await request(process.env.TEST_BASE_URL)
    .post(endpoint)
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

  await prisma.user.delete({
    where: { identifier: userId2 },
  });
});

describe("create user", () => {
  it("no required data given", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post(endpoint)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("NO_REQUIRED_DATA");
  });

  it("user with given email already exists", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post(endpoint)
      .send(user);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("USER_ALREADY_EXISTS");
  });

  it("user created successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .post(endpoint)
      .send(user2);

    expect(response.statusCode).toBe(200);
    expect(response.body.identifier).toBeDefined();

    userId2 = response.body.identifier;
  });
});

describe("get user", () => {
  it("forbidden action", async () => {
    const notExistsId = "xxx_example";
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${notExistsId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("USER_FORBIDDEN_ACTION");
  });

  it("user get successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${userId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
        identifier: userId,
      })
    );
  });
});

describe("get all users", () => {
  it("get users", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(endpoint)
      .set("Authorization", `Bearer ${jwtToken}`);
    const userData = {
      email: user.email,
      surname: user.surname,
      firstname: user.firstname,
      identifier: userId,
    };
    const userData2 = {
      email: user2.email,
      surname: user2.surname,
      firstname: user2.firstname,
      identifier: userId2,
    };
    expect(response.body).toEqual(
      expect.arrayContaining([userData, userData2])
    );
  });
});

describe("update user", () => {
  it("update user successfully", async () => {
    const newData = { ...user };
    newData["surname"] = "Styles";

    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${userId}`)
      .send(newData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        firstname: newData.firstname,
        surname: newData.surname,
        email: newData.email,
        identifier: userId,
      })
    );
  });
  it("update is forbidden action", async () => {
    const newData = { ...user };
    newData["surname"] = "Styles";

    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${userId2}`)
      .send(newData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("USER_FORBIDDEN_ACTION");
  });

  it("user with given email already exists", async () => {
    const newData = { ...user };
    newData["email"] = user2.email;

    const response = await request(process.env.TEST_BASE_URL)
      .patch(`${endpoint}/${userId}`)
      .send(newData)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("USER_ALREADY_EXISTS");
  });
});

describe("delete user", () => {
  it("delete action forbidden", async () => {
    const anotherId = "id_example";
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${anotherId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.reasonCode).toBe("USER_FORBIDDEN_ACTION");
  });

  it("delete user successfully", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .delete(`${endpoint}/${userId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(204);
  });

  it("user not exists", async () => {
    const response = await request(process.env.TEST_BASE_URL)
      .get(`${endpoint}/${userId}`)
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.reasonCode).toBe("USER_NOT_FOUND");
  });
});
