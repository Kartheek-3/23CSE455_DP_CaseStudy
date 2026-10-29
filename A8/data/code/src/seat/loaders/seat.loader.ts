import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seat } from '../entities/seat.entity';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class SeatDataLoader {
  constructor(
    @InjectRepository(Seat) private readonly seatRepo: Repository<Seat>,
  ) {}

  // 1. Standard loader: 1 Seat ID -> 1 Seat
  public readonly seatLoader = new DataLoader<string, Seat | undefined>(
    async (seatIds: string[]) => {
      const seats = await this.seatRepo.find({
        where: { id: In(seatIds) },
      });

      const mappedSeats = new Map(seats.map((seat) => [seat.id, seat]));
      return seatIds.map((id) => mappedSeats.get(id));
    },
  );

  // 2- loader which i pass the booking id and it will load all the seats
  public readonly seatManyLoader = new DataLoader<string, Seat[] | undefined>(
    async (bookingIds: string[]) => {
      const seats = await this.seatRepo.find({
        where: { booking: { id: In(bookingIds) } },
        relations: ['booking'], // every seat will load the booking entity it is associated
      });

      const seatsByBooking = new Map<string, Seat[]>();

      bookingIds.forEach((bookId) => seatsByBooking.set(bookId, [])); // every book id will has many seats
      seats.forEach((seat) => {
        const bookingId = seat.booking.id;
        if (seatsByBooking.has(bookingId))
          seatsByBooking.get(bookingId)?.push(seat);
      });

      return bookingIds.map((id) => seatsByBooking.get(id));
    },
  );
}
