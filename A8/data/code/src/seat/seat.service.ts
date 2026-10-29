import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { Repository } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat) private readonly seatRepo: Repository<Seat>,
  ) {}

  async createSeat(
    seatNo: number,
    rowNo: number,
    flightId: string,
    createBooking: Booking,
  ) {
    if (!seatNo || !rowNo || !flightId)
      throw new BadRequestException(
        `Please enter the seatNo and the rowNo and flightNo in order to proceed`,
      );

    //  Validate if the seat no if valid
    if (seatNo < 1 || seatNo > 6)
      throw new BadRequestException(`The seat no must be between 1 and 6`);

    if (rowNo < 1 || rowNo > 20)
      throw new BadRequestException(`The row no must be between 1 and 20`);

    const foundedSeat = await this.seatRepo.findOne({
      where: {
        seatNo,
        rowNo,
        flightId,
        isAvailable: false,
      },
    });

    if (foundedSeat)
      throw new BadRequestException(
        `There is a seat booked with the provided credentials!, try booking another seat`,
      );

    // you create the seat but not assign the booking related to the seat
    // The booking related to the seat will be assign later in the booking service
    const seat = this.seatRepo.create({
      seatNo,
      rowNo,
      flightId,
      booking: createBooking,
      isAvailable: false,
    });
    // seat.isAvailable = false;
    // seat.booking = createBooking;
    return await this.seatRepo.save(seat);
  }
}
