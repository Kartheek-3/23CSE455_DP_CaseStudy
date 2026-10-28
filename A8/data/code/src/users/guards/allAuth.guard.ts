import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export class allAuthGuard implements CanActivate {
  constructor(private readonly guards: CanActivate[]) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let lastError: any = null;
    console.log('all auth called');

    for (const guard of this.guards) {
      try {
        const result = await guard.canActivate(context);
        if (result) return true; // succeed if any guard passes
      } catch (err) {
        lastError = err;
      }
    }
    return lastError || new UnauthorizedException();
  }
}
