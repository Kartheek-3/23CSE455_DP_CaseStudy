import { Module } from '@nestjs/common';
import { SeatService } from './seat.service';
import { SeatResolver } from './seat.resolver';
import { Seat } from './entities/seat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, User])],
  providers: [SeatResolver, SeatService],
})
export class SeatModule {}
