import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { Repository } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { SeatClass } from './enums/seat-class.enum';

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
    seatClass?: SeatClass,
  ) {
    if (!seatNo || !rowNo || !flightId)
      throw new BadRequestException(
        `Please enter the seatNo and the rowNo and flightNo in order to proceed`,
      );

    // Validate if the seat no is valid
    if (seatNo < 1 || seatNo > 6)
      throw new BadRequestException(`The seat no must be between 1 and 6`);

    if (rowNo < 1 || rowNo > 20)
      throw new BadRequestException(`The row no must be between 1 and 20`);

    // Determine and validate seat class based on row allocation
    let resolvedClass = seatClass;
    if (!resolvedClass) {
      if (rowNo <= 3) resolvedClass = SeatClass.FIRST;
      else if (rowNo <= 8) resolvedClass = SeatClass.BUSINESS;
      else resolvedClass = SeatClass.ECONOMY;
    } else {
      if (!Object.values(SeatClass).includes(resolvedClass)) {
        throw new BadRequestException(`Invalid seat class: ${resolvedClass}`);
      }
      if (resolvedClass === SeatClass.FIRST && (rowNo < 1 || rowNo > 3)) {
        throw new BadRequestException(
          `Row ${rowNo} is invalid for FIRST class (allowed rows: 1-3)`,
        );
      }
      if (resolvedClass === SeatClass.BUSINESS && (rowNo < 4 || rowNo > 8)) {
        throw new BadRequestException(
          `Row ${rowNo} is invalid for BUSINESS class (allowed rows: 4-8)`,
        );
      }
      if (resolvedClass === SeatClass.ECONOMY && (rowNo < 9 || rowNo > 20)) {
        throw new BadRequestException(
          `Row ${rowNo} is invalid for ECONOMY class (allowed rows: 9-20)`,
        );
      }
    }

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

    const seat = this.seatRepo.create({
      seatNo,
      rowNo,
      flightId,
      booking: createBooking,
      isAvailable: false,
      seatClass: resolvedClass,
    });
    return await this.seatRepo.save(seat);
  }
}
