import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Flight } from 'src/flight/entities/flight.entity';
import { UserDataLoader } from 'src/users/loaders/user.loader';
import { FlightDataLoader } from 'src/flight/loaders/flight.loader';
import { Seat } from 'src/seat/entities/seat.entity';
import { SeatService } from 'src/seat/seat.service';
import { FlightService } from 'src/flight/flight.service';
import { SeatDataLoader } from 'src/seat/loaders/seat.loader';
import { SendGridService } from 'src/users/send-grid.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User, Flight, Seat]),
    BullModule.registerQueue({ name: 'email' }),
  ],
  providers: [
    BookingResolver,
    FlightService,
    BookingService,
    SeatService,
    UsersService,
    SendGridService,
    UserDataLoader,
    FlightDataLoader,
    SeatDataLoader,
  ],
})
export class BookingModule {}
