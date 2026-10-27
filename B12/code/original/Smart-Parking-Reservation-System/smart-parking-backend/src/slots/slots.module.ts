import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingArea } from '../parking/parking-area.entity';
import { Slot } from './slot.entity';
import { Reservation } from '../reservations/reservation.entity';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, ParkingArea, Reservation])],
  controllers: [SlotsController],
  providers: [SlotsService],
})
export class SlotsModule {}
