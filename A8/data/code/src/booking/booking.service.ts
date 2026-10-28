import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { CreateBooking } from './dtos/create-booking.dto';
import { User } from 'src/users/entities/user.entity';
import { Flight } from 'src/flight/entities/flight.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { use } from 'passport';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Flight) private readonly flightRepo: Repository<Flight>,
    @InjectRepository(Seat) private readonly seatRepo: Repository<Seat>,
  ) {}

  async createBooking(userId: string, flightId: string) {
    // 1) Check if the user exists
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user)
      throw new NotFoundException(`There is no user with an id of ${userId}`);

    // 2) All seats must belong to the same flight
    const flight = await this.flightRepo.findOne({ where: { id: flightId } });
    if (!flight) throw new NotFoundException(`Flight not found`);

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
}
