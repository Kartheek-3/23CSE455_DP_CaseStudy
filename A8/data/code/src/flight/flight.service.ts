import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFlightInput } from './dto/create-flight.input';
import { UpdateFlightInput } from './dto/update-flight.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Between, Like, Repository } from 'typeorm';
import { FlightFilterDto } from './dto/filter-flight.input.dto';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight) private readonly flightRepo: Repository<Flight>,
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

  async cancelFlight(id: string) {
    const foundedFlight = await this.flightRepo.findOne({ where: { id } });
    if (!foundedFlight)
      throw new NotFoundException(
        `There is no flight founded with an id of ${id}`,
      );

    await this.flightRepo.remove(foundedFlight);
    return { message: `flight with id of ${id} removed successfully!` };
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
