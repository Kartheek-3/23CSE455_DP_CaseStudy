import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { Slot } from '../slots/slot.entity'; // Import Slot entity
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  // Register BOTH Reservation and Slot repositories here
  imports: [TypeOrmModule.forFeature([Reservation, Slot])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
