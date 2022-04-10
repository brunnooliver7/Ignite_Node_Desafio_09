import "reflect-metadata";
import { OperationType } from "@modules/statements/entities/Statement";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import request from "supertest";
import { container } from "tsyringe";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

let connection: Connection;

describe("Get Statement Operation", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement operation", async () => {
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

    const createStatementUseCase = container.resolve(CreateStatementUseCase);

    const statement = await createStatementUseCase.execute({
      user_id: newUser.id,
      amount: 1,
      description: 'description',
      type: OperationType.DEPOSIT
    });

    const statementOperation = await request(app)
      .get(`/statements/${statement.id}`)
      .set({
        Authorization: `bearer ${userAuth.body.token}`
      });

    expect(statementOperation.status).toBe(200);
    expect(statementOperation.body).toHaveProperty('id');
    expect(statementOperation.body).toHaveProperty('user_id');
    expect(statementOperation.body.amount).toBe('1.00');
    expect(statementOperation.body.type).toBe('deposit');
    expect(statementOperation.body.user_id).toBe(newUser.id);
  });
});
