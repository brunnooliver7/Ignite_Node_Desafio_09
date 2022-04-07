import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("should be able to create a new statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'user',
      email: 'user@gmail.com',
      password: 'password'
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 1,
      description: 'description',
      type: OperationType.DEPOSIT
    });

    expect(statement).toHaveProperty('user_id');
  });

  it("should not be able to create a new statement if user does not exist", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: '1',
        amount: 1,
        description: 'description',
        type: OperationType.DEPOSIT
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a new statement if funds are insuficient", async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'user',
        email: 'user@gmail.com',
        password: 'password'
      });

      await createStatementUseCase.execute({
        user_id: user.id,
        amount: 1,
        description: 'description',
        type: OperationType.WITHDRAW
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

});
