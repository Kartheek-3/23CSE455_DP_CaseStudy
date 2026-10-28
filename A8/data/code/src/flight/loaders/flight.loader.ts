import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from '../entities/flight.entity';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';
@Injectable({ scope: Scope.REQUEST })
export class FlightDataLoader {
  constructor(
    @InjectRepository(Flight) private readonly flightRepo: Repository<Flight>,
  ) {}

  public readonly flightLoader = new DataLoader<string, Flight | undefined>(
    async (flightIds: string[]) => {
      const flights = await this.flightRepo.find({
        where: { id: In(flightIds) },
      });
      const mappedFlights = new Map(
        flights.map((flight) => [flight.id, flight]),
      );

      return flightIds.map((id) => mappedFlights.get(id));
    },
  );
}
