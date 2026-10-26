import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FlightAutoDelete {
  constructor(
    @InjectRepository(Flight) private readonly flightRepo: Repository<Flight>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoDeleteFlight() {
    const availableFlights = await this.flightRepo.find();

    await Promise.all(
      availableFlights.map(async (flight) => {
        const flightDateTimeString = `${flight.date}T${flight.departureTime}`;
        if (new Date(flightDateTimeString) < new Date()) {
          await this.flightRepo.delete(flight.id);
        }
      }),
    );
  }
}
