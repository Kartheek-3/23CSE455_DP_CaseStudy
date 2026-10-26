import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersResolver } from './users/users.resolver';
import { AuthService } from './auth.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { config } from 'process';
import { GoogleAuthModule } from './users/google-auth/google-auth.module';
import { PassportModule } from '@nestjs/passport';
import { FlightModule } from './flight/flight.module';
import { Flight } from './flight/entities/flight.entity';
import { BookingModule } from './booking/booking.module';
import { Booking } from './booking/entities/booking.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { SeatModule } from './seat/seat.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: { host: 'localhost', port: 6379 },
      defaultJobOptions: {
        attempts: 2, // if a job fails, try other two times
        removeOnComplete: 1000,
        removeOnFail: 3000,
        backoff: 2000, // if a job fails, wait at least 2s before giving another retry
      },
    }),
    UsersModule,
    PassportModule.register({ session: true }), // to register the session with passport
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get<string>('EMAIL_HOST'),
            auth: {
              user: configService.get<string>('EMAIL_USER'),
              pass: configService.get<string>('EMAIL_PASSWORD'),
            },
          },
        };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: 'src/schema.gql',
      context: ({ req, res }) => ({ req, res }), // ← REQUIRED
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),

    // Config the DB path
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    FlightModule,

    // Config the real database to be visible to the typeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get<string>('DB_USER_NAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: 'airport_app',
          entities: [User, Flight, Booking, Seat],
          synchronize: true, // Be cautious about using synchronize in production
          logging: true,
        };
      },
    }),

    GoogleAuthModule,

    BookingModule,
    UsersModule,
    SeatModule,
  ],
  // controllers: [AppController],
  providers: [],
})
export class AppModule {}
