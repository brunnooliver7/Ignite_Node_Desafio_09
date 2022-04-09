import { OperationType } from "@modules/statements/entities/Statement";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import "reflect-metadata";
import request from "supertest";
import { container } from "tsyringe";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new statement of deposit and withdraw", async () => {
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

    const statementDeposit = await request(app)
      .post("/statements/deposit")
      .send({
        user_id: newUser.id,
        amount: 100,
        description: "deposit 100",
        type: OperationType.DEPOSIT
      })
      .set({
        Authorization: `bearer ${userAuth.body.token}`
      });

    expect(statementDeposit.status).toBe(201);
    expect(statementDeposit.body).toHaveProperty("amount");
    expect(statementDeposit.body.amount).toBe(100);
    expect(statementDeposit.body.type).toBe('deposit');

    const statementWitdraw = await request(app)
      .post("/statements/withdraw")
      .send({
        user_id: newUser.id,
        amount: 30,
        description: "withdraw 30",
        type: OperationType.WITHDRAW
      })
      .set({
        Authorization: `bearer ${userAuth.body.token}`
      });

    expect(statementWitdraw.status).toBe(201);
    expect(statementWitdraw.body).toHaveProperty("amount");
    expect(statementWitdraw.body.amount).toBe(30);
    expect(statementWitdraw.body.type).toBe('withdraw');
  });

  it("should not be able to create a new statement if funds are not sufficient", async () => {
    const createUserUseCase = container.resolve(CreateUserUseCase);

    const user = {
      name: 'user2',
      email: 'user2@example.com',
      password: 'password',
    };

    const newUser = await createUserUseCase.execute(user);

    const userAuth = await request(app).post("/sessions").send({
      email: user.email,
      password: user.password,
    });

    const deposit = await request(app)
      .post("/statements/deposit")
      .send({
        user_id: newUser.id,
        amount: 1,
        description: "description",
      })
      .set({
        Authorization: `bearer ${userAuth.body.token}`
      });

    const withdraw = await request(app)
      .post("/statements/withdraw")
      .send({
        user_id: newUser.id,
        amount: 2,
        description: "description",
      })
      .set({
        Authorization: `bearer ${userAuth.body.token}`
      });

    expect(withdraw.status).toBe(400);
  });

  it("Should not be able to create new statements if token is not valid", async () => {
    const createUserUseCase = container.resolve(CreateUserUseCase);

    const user = {
      name: 'user3',
      email: 'user3@example.com',
      password: 'password',
    };

    const newUser = await createUserUseCase.execute(user);

    const response = await request(app)
      .post("/statements/deposit")
      .send({
        user_id: newUser.id,
        amount: 1,
        description: "description",
      })
      .set({
        Authorization: `noToken`
      });

    expect(response.status).toBe(401);
  });
});
