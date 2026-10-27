import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dtos/createUserInput.dto';
import { AuthService } from 'src/auth.service';
import { LoginUserInput } from './dtos/LoginUserInput.dto';
import { UpdateUserInput } from './dtos/UpdateUserInput.dto';
import { UseGuards } from '@nestjs/common';
import { forgetPasswordResponse } from './dtos/forgetPasswordResponse.dto';
import { resetPasswordDto } from './dtos/resetPassword.dto';
import { forgetPasswordDto } from './dtos/forgetPassword.dto';
import { allAuthGuard } from './guards/allAuth.guard';
import { GoogleAuthGuard } from './guards/googleAuth.guard';
import { authGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/adminAuth.guard';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => User)
  async signupUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @Context() context: any,
  ) {
    const newUser = await this.authService.createUser(createUserInput);
    context.req.session.userId = newUser.id; // to check for another auth in the following requests
    return newUser;
  }

  @Mutation(() => User)
  async loginUser(
    @Args('LoginUserInput') LoginUserInput: LoginUserInput,
    @Context() context: any,
  ) {
    const loggedInUser = await this.authService.loginUser(
      LoginUserInput.email,
      LoginUserInput.password,
    );
    context.req.session.userId = loggedInUser.id;
    return loggedInUser;
  }

  @UseGuards(new allAuthGuard([new authGuard(), new GoogleAuthGuard()]))
  @Mutation(() => User)
  updateUserInfo(
    @Args('UpdateUserInput') UpdateUserInput: UpdateUserInput,
    @Args('id') id: string,
    @Context() context: any,
  ) {
    const session = context.req?.session;
    return this.usersService.updateUserInfo(UpdateUserInput, id, session);
  }

  @UseGuards(authGuard)
  @Mutation(() => Boolean)
  logoutUser(@Context() context: any, @Args('id') id: string) {
    const { session } = context.req;
    return this.usersService.logoutUser(session, id);
  }

  @Query(() => forgetPasswordResponse)
  async forgetPassword(
    @Args('resetPasswordDto') resetPasswordBody: resetPasswordDto,
  ) {
    // 1) Generate the random token in the server side
    const token = await this.authService.generateRandomToken(
      resetPasswordBody.email,
    );

    // 2) Register the email sending to the queue => Creating job in the queue which is responisble for sending mails
    await this.emailQueue.add('sending-token-mailtrap', {
      email: resetPasswordBody.email,
      token,
    });

    // The sending mail  logic can be handeled on the queue side
    return {
      message: 'Token Sent Successfully to your email, please check that',
    };
  }

  @Mutation(() => forgetPasswordResponse)
  async resetPassword(
    @Args('forgetPassword') forgetPasswordBody: forgetPasswordDto,
    @Args('token') token: string,
  ) {
    await this.authService.forgetPassword(forgetPasswordBody, token);
    return { message: 'password Changed Successfully!' };
  }

  @UseGuards(
    new allAuthGuard([new authGuard(), new GoogleAuthGuard()]),
    AdminGuard,
  )
  @Mutation(() => User)
  async approveMembers(@Args('id') id: string) {
    return await this.usersService.approveMembers(id);
  }
  @Query(() => String)
  hello(): string {
    return 'Hello World!';
  }
}
