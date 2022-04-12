import "reflect-metadata";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Create User", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create an user", async () => {
    const user = {
      name: 'user',
      email: 'user@example.com',
      password: 'password',
    };

    const newUser = await request(app)
      .post("/users")
      .send(user);

    expect(newUser.status).toBe(201);
  });
});
