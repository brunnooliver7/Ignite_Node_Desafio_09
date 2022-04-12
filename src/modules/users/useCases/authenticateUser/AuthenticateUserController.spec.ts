import "reflect-metadata";
import request from "supertest";
import { container } from "tsyringe";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let connection: Connection;

describe("Authenticate User", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    const createUserUseCase = container.resolve(CreateUserUseCase);

    const user = {
      name: 'user',
      email: 'user@example.com',
      password: 'password',
    };

    await createUserUseCase.execute(user);

    const userAuth = await request(app).post("/sessions").send({
      email: user.email,
      password: user.password,
    });

    expect(userAuth.status).toBe(200);
    expect(userAuth.body).toHaveProperty("user");
    expect(userAuth.body).toHaveProperty("token");
  });

});
