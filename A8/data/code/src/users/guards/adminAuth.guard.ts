import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userSevice: UsersService) {}
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const { userId } = request.session;
    if (!userId) return false;
    const foundedUser = await this.userSevice.findOne(userId);
    if (foundedUser && foundedUser.role === 'ADMIN') return true;
    return false;
  }
}
