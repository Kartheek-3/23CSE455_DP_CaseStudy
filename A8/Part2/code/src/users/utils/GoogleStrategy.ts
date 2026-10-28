import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
  ) {
    const clientID =
      configService.get<string>('GOOGLE_AUTH_CLIENT_ID') ||
      'LOCAL_DEVELOPMENT_CLIENT_ID';

    const clientSecret =
      configService.get<string>('GOOGLE_AUTH_CLIENT_SECRET') ||
      'LOCAL_DEVELOPMENT_CLIENT_SECRET';

    super({
      clientID,
      clientSecret,
      callbackURL: 'http://localhost:3000/api/auth/google/redirect',
      scope: ['email', 'profile'],
    });

    if (
      !configService.get<string>('GOOGLE_AUTH_CLIENT_ID') ||
      !configService.get<string>('GOOGLE_AUTH_CLIENT_SECRET')
    ) {
      console.warn(
        '[GoogleStrategy] Google OAuth credentials not configured. ' +
          'Google login is disabled for local development.',
      );
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const user = await this.authService.validateUserGoogleAuth({
      email: profile.emails?.[0]?.value ?? 'null',
      displayName: profile.displayName,
    });

    console.log('validating in google strategy!');

    return user || null;
  }
}