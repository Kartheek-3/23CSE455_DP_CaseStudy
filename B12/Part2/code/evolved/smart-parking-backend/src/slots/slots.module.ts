import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingArea } from '../parking/parking-area.entity';
import { Slot } from './slot.entity';
import { Reservation } from '../reservations/reservation.entity';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';
import { FirstAvailableStrategy } from './allocation/first-available.strategy';
import { NearestToEntranceStrategy } from './allocation/nearest-to-entrance.strategy';
import { EvPreferredStrategy } from './allocation/ev-preferred.strategy';
import { SlotAllocationContext } from './allocation/slot-allocation.context';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, ParkingArea, Reservation])],
  controllers: [SlotsController],
  providers: [
    SlotsService,
    FirstAvailableStrategy,
    NearestToEntranceStrategy,
    EvPreferredStrategy,
    {
      provide: SlotAllocationContext,
      useFactory: (
        firstAvailable: FirstAvailableStrategy,
        nearestToEntrance: NearestToEntranceStrategy,
        evPreferred: EvPreferredStrategy,
      ) =>
        new SlotAllocationContext([
          firstAvailable,
          nearestToEntrance,
          evPreferred,
        ]),
      inject: [
        FirstAvailableStrategy,
        NearestToEntranceStrategy,
        EvPreferredStrategy,
      ],
    },
  ],
})
export class SlotsModule {}
