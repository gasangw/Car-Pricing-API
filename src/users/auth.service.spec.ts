import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';

describe('The authservice', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUserService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
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

  it('should throw an error if the email is in use', async () => {
    fakeUserService.find = () =>
      Promise.resolve([{ id: 1, email: 'thom', password: '123' }]);
    try {
      await service.signin('thomas@gmail.com', 'tomi333');
    } catch (error) {
      done();
    }
  });
});
