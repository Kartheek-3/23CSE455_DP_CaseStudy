import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { CreateBooking } from './dtos/create-booking.dto';
import { Res, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';
import { allAuthGuard } from 'src/users/guards/allAuth.guard';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from 'src/users/guards/googleAuth.guard';
import { AdminGuard } from 'src/users/guards/adminAuth.guard';
import { authGuard } from 'src/users/guards/auth.guard';
import { currentUser } from 'src/users/decorators/current-user.decorator';
import { responseMessage } from './dtos/cancel-booking-response.dto';
import { CancelBooking } from './dtos/cancel-booking.input.dto';
import { User } from 'src/users/entities/user.entity';
import { UserDataLoader } from 'src/users/loaders/user.loader';
import { FlightDataLoader } from 'src/flight/loaders/flight.loader';
import { Flight } from 'src/flight/entities/flight.entity';
import { rolesRestrict } from 'src/flight/guards/roles.restrict.guard';
import { SeatService } from 'src/seat/seat.service';
import { FlightService } from 'src/flight/flight.service';
import { Seat } from 'src/seat/entities/seat.entity';
import { SeatDataLoader } from 'src/seat/loaders/seat.loader';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { SendGridService } from 'src/users/send-grid.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@UseGuards(new allAuthGuard([new authGuard(), new GoogleAuthGuard()]))
@Resolver(() => Booking)
export class BookingResolver {
  constructor(
    private readonly bookingService: BookingService,
    private readonly seatService: SeatService,
    private readonly userLoader: UserDataLoader,
    private readonly flightLoader: FlightDataLoader,
    private readonly flightService: FlightService,
    private readonly seatLoader: SeatDataLoader,
    private readonly sendGridService: SendGridService,
    // private readonly userService: UsersService,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  @Mutation(() => Booking)
  @UseGuards(rolesRestrict('USER'))
  async createBooking(
    @currentUser() user: string,
    @Args('createBooking') bookingBody: CreateBooking,
  ) {
    // 1) Create the seats
    // The res is all the seats without the booking associated with them
    const createBooking = await this.bookingService.createBooking(
      user,
      bookingBody.seats[0].flightId,
    );

    await Promise.all(
      bookingBody.seats.map(async (seat) => {
        const newCreatedSeat = await this.seatService.createSeat(
          seat.seatNo,
          seat.rowNo,
          seat.flightId,
          createBooking,
        );

        // createBooking.seatId.push(newCreatedSeat.id);
        // console.log(newCreatedSeat);
        return newCreatedSeat;
      }),
    );

    // Mail to the client after make a booking

    console.log(createBooking);
    // REAL MAIL SENDING
    // Will be Disabled
    await this.sendGridService.send({
      to: createBooking.user.email,
      subject: 'You booking have been confirmed',
      from: 'zeyadalbadawyamm@gmail.com', // Fill it with your validated email on SendGrid account
      text: `booking flight from ${createBooking.flight.departureAirport} to ${createBooking.flight.destinationAirport} has been booked successfully`,
    });
    return await this.bookingRepo.save(createBooking);
  }

  @Query(() => [Seat])
  @UseGuards(rolesRestrict('USER'))
  AllSeatsBookings(
    @currentUser() user: string,
    @Args('bookingId', { type: () => String }) bookingId: string, // add explicit type
  ) {
    return this.bookingService.allSeatsBooked(user, bookingId);
  }

  @Mutation(() => responseMessage)
  @UseGuards(rolesRestrict('USER'))
  cancelBooking(
    @currentUser() user: string,
    @Args('cancelBooking') cancelBody: CancelBooking,
  ) {
    return this.bookingService.cancelBooking(user, cancelBody.bookingId);
  }

  @ResolveField(() => User)
  async user(@Parent() booking: Booking) {
    return this.userLoader.userLoader.load(booking.userId);
  }

  @ResolveField(() => Flight)
  async flight(@Parent() booking: Booking) {
    return this.flightLoader.flightLoader.load(booking.flightId);
  }

  @ResolveField(() => [Seat])
  async seat(@Parent() Booking: Booking) {
    return this.seatLoader.seatManyLoader.load(Booking.id);
  }
}
