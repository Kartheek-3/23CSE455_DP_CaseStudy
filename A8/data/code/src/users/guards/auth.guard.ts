import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Context, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

export class authGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    // console.log('SESSION RECEIVED BY GUARD:');
    // console.log(request.session);
    // console.log('COOKIE:', request.headers.cookie);

    console.log('auth is called');
    return !!request?.session?.userId;
  }
}
