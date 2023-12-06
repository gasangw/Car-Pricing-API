import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';

describe('The authservice', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    const users = [];
    fakeUserService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  test('should return an instance of the authservice', async () => {
    expect(service).toBeDefined();
  });

  it('should create a new user with a salted and hashed password', async () => {
    const user = await service.signup('thomas@gmail.com', 'thom123');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('should throw if signin is called with an unused email', async (done) => {
    try {
      await service.signin('adsg@gmail.com', 'tomi3435');
    } catch (error) {
      done();
    }
  });

  it('It should return a user if the right password is provided', async () => {
    await service.signup('thomas@gmail.com', 'thom134');
    const user = await service.signin('thomas@gmail.com', 'thom134');
    expect(user).toBeDefined();
  });
});
