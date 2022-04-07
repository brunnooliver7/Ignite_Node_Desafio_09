import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate user", async () => {
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

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(userAuthenticated).toHaveProperty("token");
    expect(userAuthenticated).toHaveProperty("user");
  });

  it("should not be able to authenticate user if user does not exist", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'user@gmail.com',
        password: 'password'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

  it("should not be able to authenticate user if password does not match", async () => {
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

      await authenticateUserUseCase.execute({
        email: 'user@gmail.com',
        password: 'senha'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

});
