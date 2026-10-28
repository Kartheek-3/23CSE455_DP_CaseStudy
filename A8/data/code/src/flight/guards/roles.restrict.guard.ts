import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

export function rolesRestrict(...allowedRoles: string[]): Type<CanActivate> {
  @Injectable()
  class RolesRestriceGuard implements CanActivate {
    constructor(private readonly userService: UsersService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext().req;
      const { userId } = request.session;
      if (!userId) return false;
      console.log(userId);
      const user = await this.userService.findOne(userId);
      if (!user) return false;
      return allowedRoles.includes(user.role);
    }
  }
  return mixin(RolesRestriceGuard);
}
