import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dtos/UpdateUserInput.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Role } from './enums/roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly mailService: MailerService,
  ) {}

  sendMail(token: string, email: string) {
    const message = `Forgot your password, try patch Request to /forget-password/${token}? If you didn't forget your password, please ignore this email!`;
    return this.mailService.sendMail({
      from: 'Zeyad albadawy <zeyadalbadawyamm@gmail.com>',
      to: email,
      subject: `Password Reset`,
      text: message,
    });
  }

  find(email: string) {
    return this.userRepo.find({ where: { email } });
  }

  findOne(id: string) {
    return this.userRepo.findOneBy({ id });
  }

  findAll() {
    return this.userRepo.find();
  }

  async create(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Role,
  ) {
    const newUser = this.userRepo.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    await this.userRepo.save(newUser);
    return newUser;
  }

  async updateUserInfo(attrs: Partial<User>, id: string, loggedInSession: any) {
    if (id != loggedInSession.userId)
      throw new UnauthorizedException(
        'You are not logged in correctly, try to login with the user id you are trying to update',
      );
    const foundedUser = await this.findOne(id);
    if (!foundedUser)
      throw new NotFoundException(`There is no user with the id of ${id}`);
    if (attrs.firstName !== undefined) foundedUser.firstName = attrs.firstName;
    if (attrs.lastName !== undefined) foundedUser.lastName = attrs.lastName;
    if (attrs.email !== undefined) foundedUser.email = attrs.email;

    return this.userRepo.save(foundedUser);
  }
  async logoutUser(session: any, id: string) {
    if (session.userId !== id)
      throw new UnauthorizedException(`You are not allowed to do this action`);
    session.userId = undefined;
    return true;
  }

  async approveMembers(id: string) {
    const foundedUser = await this.userRepo.findOneBy({ id });
    if (!foundedUser)
      throw new NotFoundException(`There is no user with an id of ${id}`);
    foundedUser.approved = true;
    return this.userRepo.save(foundedUser);
  }
}
