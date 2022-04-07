import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create user", async () => {
    const user: ICreateUserDTO = {
      name: 'user',
      email: 'user@gmail.com',
      password: 'password'
    }

    const response = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    expect(response).toHaveProperty('id');
  });

  it("should not be able to create user if user already exists", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: 'user',
        email: 'user@gmail.com',
        password: 'password'
      }

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
