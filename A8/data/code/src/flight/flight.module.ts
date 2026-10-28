import { Module } from '@nestjs/common';
import { FlightService } from './flight.service';
import { FlightResolver } from './flight.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { StaffService } from './staff.service';
import { FlightAutoDelete } from './flight-auto-delete.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flight, User])],
  providers: [
    FlightResolver,
    FlightService,
    UsersService,
    StaffService,
    FlightAutoDelete,
  ],
})
export class FlightModule {}
