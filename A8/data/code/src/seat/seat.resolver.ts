import { Resolver } from '@nestjs/graphql';
import { SeatService } from './seat.service';

@Resolver()
export class SeatResolver {
  constructor(private readonly seatService: SeatService) {}
}
