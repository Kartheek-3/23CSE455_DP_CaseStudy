import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/users/enums/roles';
import { FlightAssign } from './dto/assign-flight.input';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Flight) private readonly flightRepo: Repository<Flight>,
    private readonly userService: UsersService,
  ) {}

  // Admin
  async staffManagement(assignBody: FlightAssign) {
    const foundedUser = await this.userService.findOne(assignBody.userId);
    if (!foundedUser)
      throw new NotFoundException(
        `There is an error while retriving the user currently signed in, try again later`,
      );

    if (![Role.CREW, Role.SECURITY].includes(foundedUser.role))
      throw new BadRequestException(
        `You can assign the flights to crew and security member only!`,
      );

    if (!foundedUser.approved)
      throw new BadRequestException(
        `You must approve the ${foundedUser.role} ${foundedUser.firstName} with an id of ${foundedUser.id} before assiggning flight to him!`,
      );

    const foundedFlight = await this.flightRepo.findOneBy({
      id: assignBody.flightId,
    });

    if (!foundedFlight)
      throw new NotFoundException(
        `There is no flight founded with an id of ${assignBody.flightId}`,
      );

    return { foundedFlight, foundedUser };
  }

  // admin
  async assignFlightTo(assignBody: FlightAssign) {
    const founded = await this.staffManagement(assignBody);
    founded.foundedFlight.responsibleBy = founded.foundedUser;
    return await this.flightRepo.save(founded.foundedFlight);
  }

  async removeStaffFromFlight(assignBody: FlightAssign) {
    const founded = await this.staffManagement(assignBody);
    founded.foundedFlight.responsibleBy = null;
    return await this.flightRepo.save(founded.foundedFlight);
  }

  // My assigned flight
  async myAssignedFlights(userId: string) {
    const foundedFlights = await this.flightRepo.find({
      where: { responsibleBy: { id: userId } },
    });

    return foundedFlights;
  }
}
