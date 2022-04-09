import "reflect-metadata";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import request from "supertest";
import { container } from "tsyringe";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get user balance", async () => {
    const createUserUseCase = container.resolve(CreateUserUseCase);

    const user = {
      name: 'user',
      email: 'user@example.com',
      password: 'password',
    };

    const newUser = await createUserUseCase.execute(user);

    const userAuth = await request(app).post("/sessions").send({
      email: user.email,
      password: user.password,
    });

    await request(app)
      .post("/statements/deposit")
      .send({
        user_id: newUser.id,
        amount: 100,
        description: "Deposit 100",
      })
      .set({
        Authorization: `bearer ${userAuth.body.token}`,
      });

    await request(app)
      .post("/statements/withdraw")
      .send({
        user_id: newUser.id,
        amount: 30,
        description: "Withdraw 50",
      })
      .set({
        Authorization: `bearer ${userAuth.body.token}`,
      });

    const balance = await request(app)
      .get("/statements/balance")
      .set({
        Authorization: `bearer ${userAuth.body.token}`
      });

    expect(balance.status).toBe(200);
    expect(balance.body.statement.length).toBe(2);
    expect(balance.body.balance).toBe(70);
  });
});
