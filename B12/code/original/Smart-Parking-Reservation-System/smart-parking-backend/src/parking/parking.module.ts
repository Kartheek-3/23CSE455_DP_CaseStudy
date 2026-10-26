import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingArea } from './parking-area.entity';
import { ParkingController } from './parking.controller';
import { ParkingService } from './parking.service';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingArea])],
  controllers: [ParkingController],
  providers: [ParkingService],
})
export class ParkingModule {}
