import "reflect-metadata";
import request from "supertest";
import { container } from "tsyringe";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let connection: Connection;

describe("Show User Profile", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
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

    const userProfile = await request(app)
      .get("/profile")
      .set({
        Authorization: `Bearer ${userAuth.body.token}`
      });

    expect(userProfile.status).toBe(200);
    expect(userProfile.body).toHaveProperty("id");
    expect(userProfile.body).toHaveProperty("email");
    expect(userProfile.body).toHaveProperty("created_at");
    expect(userProfile.body).toHaveProperty("updated_at");
  });
});
