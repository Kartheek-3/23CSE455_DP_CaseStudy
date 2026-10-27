import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  const configService = app.get(ConfigService);

  // 1. CORS
  app.enableCors({
    origin: 'https://sandbox.embed.apollographql.com',
    credentials: true,
  });

  // 2. SESSION
  app.use(
    session({
      secret: configService.getOrThrow<string>('COOKIE_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // ← FIXED
        maxAge: 1000 * 60 * 60,
      },
    }),
  );

  // Passport sesstion
  app.use(passport.initialize());
  app.use(passport.session());

  // 3. Pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
