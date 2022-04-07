import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'user',
      email: 'user@gmail.com',
      password: 'password'
    });

    const userProfile = await showUserProfileUseCase.execute(user.id);

    expect(userProfile).toHaveProperty('id')
  });

  it("should not be able to show user profile if user does not exist", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('1');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
