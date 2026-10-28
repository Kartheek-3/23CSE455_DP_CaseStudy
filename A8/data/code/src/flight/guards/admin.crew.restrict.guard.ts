import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FlightRestrict implements CanActivate {
  constructor(private readonly userService: UsersService) {}
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const { userId } = request.session;
    if (!userId) return false;
    const foundedUser = await this.userService.findOne(userId);
    if (!foundedUser) return false;
    const checkedRoles = ['ADMIN', 'CREW'];
    if (!checkedRoles.includes(foundedUser.role)) return false;
    return true;
  }
}
