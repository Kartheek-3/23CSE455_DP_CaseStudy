import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { CreateBooking } from './dtos/create-booking.dto';
import { UpdateBooking } from './dtos/update-booking.dto';
import { User } from 'src/users/entities/user.entity';
import { Flight } from 'src/flight/entities/flight.entity';
import { FlightStatus } from 'src/flight/enums/flight-status.enum';
import { Seat } from 'src/seat/entities/seat.entity';
import { SeatService } from 'src/seat/seat.service';
import { use } from 'passport';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Flight) private readonly flightRepo: Repository<Flight>,
    @InjectRepository(Seat) private readonly seatRepo: Repository<Seat>,
    @Optional() private readonly seatService?: SeatService,
  ) {}

  async createBooking(userId: string, flightId: string) {
    // 1) Check if the user exists
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user)
      throw new NotFoundException(`There is no user with an id of ${userId}`);

    // 2) All seats must belong to the same flight
    const flight = await this.flightRepo.findOne({ where: { id: flightId } });
    if (!flight) throw new NotFoundException(`Flight not found`);

    if (flight.status === FlightStatus.CANCELLED) {
      throw new BadRequestException(`Cannot book seats on a cancelled flight`);
    }

    // 3) Check if user already booked this flight
    const foundedBooking = await this.bookingRepo.findOne({
      where: {
        user: { id: userId },
        flight: { id: flightId },
      },
      // relations: ['user', 'flight', 'seat'],
    });
    console.log(foundedBooking);

    const newBooking = this.bookingRepo.create({
      user,
      flight,
      userId,
      flightId,
    });

    // the seat no being assigned yet seat: Seat[]
    // so it is a must at a seat copy to assign it to the booking

    // Save booking to generate UUID
    const savedBooking = await this.bookingRepo.save(newBooking);

    // Assign the bookiong related each seat to the currently booking
    return savedBooking;
  }

  async allSeatsBooked(userId: string, bookingId: string) {
    const bookingFound = await this.bookingRepo.findOne({
      where: {
        userId: userId,
        id: bookingId,
      },
      relations: ['user', 'seat'],
    });

    if (!bookingFound)
      throw new NotFoundException(`There is no booking with the provided id`);

    return bookingFound.seat;
  }

  async cancelBooking(userId: string, bookingId: string) {
    const foundedBooking = await this.bookingRepo.findOne({
      where: {
        id: bookingId,
        user: { id: userId },
      },
      relations: ['user', 'flight', 'seat'],
    });
    if (!foundedBooking)
      throw new UnauthorizedException(
        `There is no booking with the provided id or it belongs to a different user!`,
      );
    foundedBooking.flight.availableSeats += foundedBooking.seat.length;
    await this.flightRepo.save(foundedBooking.flight);
    await this.bookingRepo.delete(foundedBooking.id);
    return {
      message: `booking with an id of ${foundedBooking.id} has been deleted successfully!`,
    };
  }

  async modifyBooking(
    userId: string,
    updateInput: UpdateBooking,
  ): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: updateInput.bookingId },
      relations: ['user', 'flight', 'seat'],
    });

    if (!booking) {
      throw new NotFoundException(`There is no booking with the provided id`);
    }

    if (booking.userId !== userId && booking.user?.id !== userId) {
      throw new UnauthorizedException(
        `There is no booking with the provided id or it belongs to a different user!`,
      );
    }

    // Check cancellation state of current flight
    if (booking.flight.status === FlightStatus.CANCELLED) {
      throw new BadRequestException(
        `Cannot modify a booking for a cancelled flight`,
      );
    }

    let targetFlight = booking.flight;

    // 1) Changing flight
    if (updateInput.flightId && updateInput.flightId !== booking.flightId) {
      const newFlight = await this.flightRepo.findOne({
        where: { id: updateInput.flightId },
      });
      if (!newFlight) {
        throw new NotFoundException(`Target flight not found`);
      }
      if (newFlight.status === FlightStatus.CANCELLED) {
        throw new BadRequestException(
          `Cannot transfer booking to a cancelled flight`,
        );
      }

      const seatsToBookCount =
        updateInput.seats && updateInput.seats.length > 0
          ? updateInput.seats.length
          : booking.seat?.length || 1;

      if (newFlight.availableSeats < seatsToBookCount) {
        throw new BadRequestException(
          `Target flight does not have enough available seats`,
        );
      }

      // Restore available seats on old flight
      booking.flight.availableSeats += booking.seat?.length || 0;
      await this.flightRepo.save(booking.flight);

      // Deduct available seats on new flight
      newFlight.availableSeats -= seatsToBookCount;
      await this.flightRepo.save(newFlight);

      booking.flight = newFlight;
      booking.flightId = newFlight.id;
      targetFlight = newFlight;
    }

    // 2) Changing seat / seat class
    if (updateInput.seats && updateInput.seats.length > 0) {
      // Remove previous seats
      if (booking.seat && booking.seat.length > 0) {
        for (const oldSeat of booking.seat) {
          await this.seatRepo.delete(oldSeat.id);
        }
      }

      const updatedSeats: Seat[] = [];
      for (const seatInput of updateInput.seats) {
        if (this.seatService) {
          const newSeat = await this.seatService.createSeat(
            seatInput.seatNo,
            seatInput.rowNo,
            targetFlight.id,
            booking,
            seatInput.seatClass,
          );
          updatedSeats.push(newSeat);
        } else {
          const newSeat = this.seatRepo.create({
            seatNo: seatInput.seatNo,
            rowNo: seatInput.rowNo,
            flightId: targetFlight.id,
            booking,
            isAvailable: false,
            seatClass: seatInput.seatClass,
          });
          updatedSeats.push(await this.seatRepo.save(newSeat));
        }
      }
      booking.seat = updatedSeats;
    }

    return await this.bookingRepo.save(booking);
  }
}
