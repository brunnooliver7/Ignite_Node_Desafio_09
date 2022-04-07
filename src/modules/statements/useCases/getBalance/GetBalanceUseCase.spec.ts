import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("should be able to get balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'user',
      email: 'user@gmail.com',
      password: 'password'
    });

    const response = await getBalanceUseCase.execute({ user_id: user.id });

    expect(response).toHaveProperty("balance");
    expect(response.balance).toEqual(0);
  });

  it("should not be able to get balance if user does not exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: '1' });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

});
