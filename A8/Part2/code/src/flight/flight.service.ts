import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { CreateFlightInput } from './dto/create-flight.input';
import { UpdateFlightInput } from './dto/update-flight.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Between, Like, Repository } from 'typeorm';
import { FlightFilterDto } from './dto/filter-flight.input.dto';
import { FlightStatus } from './enums/flight-status.enum';
import { Seat } from 'src/seat/entities/seat.entity';
import { SendGridService } from 'src/users/send-grid.service';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight) private readonly flightRepo: Repository<Flight>,
    @InjectRepository(Seat) private readonly seatRepo: Repository<Seat>,
    @Optional() private readonly sendGridService?: SendGridService,
  ) {}

  async createFlight(flightInput: CreateFlightInput) {
    const { date } = flightInput;

    const flightDate = new Date(date);
    if (flightDate < new Date(Date.now()))
      throw new BadRequestException(
        `The day of the flight must be in the future`,
      );
    const newFlight = this.flightRepo.create(flightInput);
    return await this.flightRepo.save(newFlight);
  }

  // It doesn't necessary require the same admin or crew to update it, any one with the same role
  async updateFlight(id: string, flightInput: UpdateFlightInput) {
    const foundedFlight = await this.flightRepo.findOne({ where: { id } });
    if (!foundedFlight)
      throw new NotFoundException(
        `There is no flight founded with an id of ${id}`,
      );

    Object.assign(foundedFlight, this.updateFlight);
    return this.flightRepo.save(foundedFlight);
  }

  async cancelFlight(id: string): Promise<Flight> {
    const foundedFlight = await this.flightRepo.findOne({
      where: { id },
      relations: ['bookings', 'bookings.seat', 'bookings.user'],
    });
    if (!foundedFlight)
      throw new NotFoundException(
        `There is no flight founded with an id of ${id}`,
      );

    if (foundedFlight.status === FlightStatus.CANCELLED) {
      throw new BadRequestException(`Flight is already cancelled`);
    }

    foundedFlight.status = FlightStatus.CANCELLED;
    foundedFlight.availableSeats = 0;
    const savedFlight = await this.flightRepo.save(foundedFlight);

    // Release all booked seats for this flight to ensure seat consistency
    await this.seatRepo.update({ flightId: id }, { isAvailable: true });

    // Asynchronously dispatch passenger cancellation notifications via BullMQ queue if email service is active
    if (this.sendGridService && foundedFlight.bookings) {
      for (const booking of foundedFlight.bookings) {
        if (booking.user?.email) {
          await this.sendGridService.send({
            to: booking.user.email,
            subject: `Flight Cancellation Notice: Flight ${foundedFlight.flightNumber}`,
            from: 'zeyadalbadawyamm@gmail.com',
            text: `Dear passenger, your flight ${foundedFlight.flightNumber} from ${foundedFlight.departureAirport} to ${foundedFlight.destinationAirport} has been cancelled.`,
          });
        }
      }
    }

    return savedFlight;
  }

  async retriveFlights(filterFlightInput: FlightFilterDto) {
    const {
      page,
      limit,
      departureTime,
      destinationAirport,
      departureAirport,
      airLine,
      date,
    } = filterFlightInput;
    const skip = (page - 1) * limit;
    const where: any = {};
    where.destinationAirport = Like(`%${destinationAirport}%`);
    where.departureAirport = Like(`%${departureAirport}%`);
    where.date = date;
    if (airLine) where.airline = Like(`%${airLine}%`);

    const [data, total] = await this.flightRepo.findAndCount({
      where,
      take: limit,
      skip: skip,
      order: { departureTime: 'ASC' },
    });

    const lastPage = Math.ceil(total / limit);
    return {
      flights: data,
      total: total,
      lastPage,
      currentPage: page,
      perPage: limit,
    };
  }

  async decreaseSeatNo(noOfSeats: number, flightId: string) {
    const foundedFlight = await this.flightRepo.findOne({
      where: { id: flightId },
    });

    if (!foundedFlight)
      throw new NotFoundException(`There is no flight with the provided id`);
    foundedFlight.availableSeats -= noOfSeats;
    await this.flightRepo.save(foundedFlight);
  }
}
