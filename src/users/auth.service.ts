import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(email: string, password: string) {
    // see if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }
    // create salt
    // hash the users password
    const salt = randomBytes(8).toString('hex');
    const hashedPassword = (await scrypt(password, salt, 32)) as Buffer;
    const result = `${salt}.${hashedPassword.toString('hex')}`;
    // create a new users and save it
    const user = this.usersService.create(email, result);
    // return the users
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new BadRequestException('Wrong email provided');
    }

    const [salt, storedHashedPassword] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHashedPassword !== hash.toString('hex')) {
      throw new NotFoundException('Wrong password');
    }
    return user;
  }
}
