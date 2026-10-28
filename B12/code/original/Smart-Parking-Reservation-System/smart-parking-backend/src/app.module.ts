import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { ParkingModule } from './parking/parking.module';
import { SlotsModule } from './slots/slots.module';
import { ReservationsModule } from './reservations/reservations.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? {
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          }
        : {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT ?? '5432', 10),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
          }),
      autoLoadEntities: true,
      synchronize: true, // Auto-creates database tables (useful for dev)
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
    ParkingModule,
    SlotsModule,
    ReservationsModule,
    AuthModule,
    MailModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
