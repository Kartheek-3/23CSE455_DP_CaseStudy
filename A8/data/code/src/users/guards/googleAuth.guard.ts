import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// google auth gaurd extends the google strategy
@Injectable()
export class GoogleAuthGuard
  extends AuthGuard('google')
  implements CanActivate
{
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    // console.log(request.session.passport.user.id);
    return activate;
  }
}
