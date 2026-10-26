import { forwardRef, Module } from '@nestjs/common';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleStrategy } from '../utils/GoogleStrategy';
import { AuthService } from 'src/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersModule } from '../../users/users.module';
import { SessionSerializer } from '../utils/serializers';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => UsersModule)],
  controllers: [GoogleAuthController],
  providers: [
    GoogleStrategy,
    SessionSerializer,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
  ],
})
export class GoogleAuthModule {}
