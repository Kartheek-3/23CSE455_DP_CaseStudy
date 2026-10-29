import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { CreateUserInput } from './users/dtos/createUserInput.dto';
import { UsersService } from './users/users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import * as crypto from 'crypto';
import { forgetPasswordDto } from './users/dtos/forgetPassword.dto';
import { userDetail } from './users/dtos/googleAuth/createUser.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly userService: UsersService,
  ) {}
  async createUser(body: CreateUserInput) {
    const { email, firstName, lastName, password, role } = body;
    console.log('auth.createUser body ->', body);

    console.log(body);
    const foundedUser = await this.userService.find(email);
    if (foundedUser.length)
      throw new BadRequestException(
        `There is another user with the email of ${email}`,
      );

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const finalPasswordHashed = salt + '.' + hash.toString('hex');
    const newUser = this.userService.create(
      firstName,
      lastName,
      email,
      finalPasswordHashed,
      role,
    );
    return newUser;
  }

  async loginUser(email: string, password: string) {
    const [User] = await this.userService.find(email);
    if (!User)
      throw new NotFoundException(`There is no user with the email ${email}`);
    const [salt, hashedPassword] = User.password?.split('.')!;
    const newHashedPassword = (await scrypt(password, salt, 32)) as Buffer;
    if (hashedPassword !== newHashedPassword.toString('hex'))
      throw new BadRequestException(
        `The email or password is incorrect, try again later`,
      );
    return User;
  }

  async hashPassword(password: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return salt + '.' + hash.toString('hex');
  }

  async generateRandomToken(email: string) {
    const [User] = await this.userService.find(email);
    if (!User)
      throw new NotFoundException('there is no user with the provided email');
    const resetToken = crypto.randomBytes(32).toString('hex');

    User.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    User.passwordResetTokenExpirationDate = new Date(
      Date.now() + 10 * 60 * 1000,
    );
    await this.userRepo.save(User);
    return resetToken;
  }

  // this reset password from outside the account not from inside
  async forgetPassword(inputBody: forgetPasswordDto, token: string) {
    const { email, password } = inputBody;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const foundedUser = await this.userRepo.findOne({
      where: {
        email,
        passwordResetToken: hashedToken,
        passwordResetTokenExpirationDate: MoreThan(new Date()),
      },
    });
    if (!foundedUser) throw new NotFoundException(`no matching credintials`);

    foundedUser.password = await this.hashPassword(password);
    foundedUser.passwordResetToken = null;
    foundedUser.passwordResetTokenExpirationDate = null;

    await this.userRepo.save(foundedUser);
    return;
  }

  // Google AUTH
  async validateUserGoogleAuth(userDetail: userDetail) {
    const foundedUser = await this.userRepo.findOne({
      where: { email: userDetail.email },
    });

    console.log('there is a user founded');
    if (foundedUser) return foundedUser;

    console.log('no user found try to creating it');
    const newUser = this.userRepo.create({
      email: userDetail.email,
      firstName: userDetail.displayName,
    });

    return this.userRepo.save(newUser);
  }

  async findUser(userId: string) {
    const foundedUser = await this.userRepo.findOneBy({ id: userId });
    return foundedUser;
  }
}
