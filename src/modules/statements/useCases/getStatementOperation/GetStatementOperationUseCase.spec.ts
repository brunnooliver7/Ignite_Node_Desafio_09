import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'user',
      email: 'user@gmail.com',
      password: 'password'
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id,
      description: 'description',
      amount: 1,
      type: OperationType.DEPOSIT
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id
    });

    expect(statementOperation).toHaveProperty('id');
    expect(statementOperation).toHaveProperty('user_id');
    expect(statementOperation).toHaveProperty('description');
    expect(statementOperation).toHaveProperty('amount');
    expect(statementOperation).toHaveProperty('type');
    expect(statementOperation.user_id).toEqual(user.id);
    expect(statementOperation.amount).toEqual(1);
  });

  it("should not be able to get statement operation if user does not exist", async () => {
    expect(async () => {
      const statement = await inMemoryStatementsRepository.create({
        user_id: '1',
        description: 'description',
        amount: 1,
        type: OperationType.DEPOSIT
      });

      await getStatementOperationUseCase.execute({
        user_id: '1',
        statement_id: statement.id
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement operation if statement does not exist", async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'user',
        email: 'user@gmail.com',
        password: 'password'
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: '1'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

});
