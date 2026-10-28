import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { FlightService } from './flight.service';
import { Flight } from './entities/flight.entity';
import { CreateFlightInput } from './dto/create-flight.input';
import { UseGuards } from '@nestjs/common';
import { FlightRestrict } from './guards/admin.crew.restrict.guard';
import { allAuthGuard } from 'src/users/guards/allAuth.guard';
import { authGuard } from 'src/users/guards/auth.guard';
import { GoogleAuthGuard } from 'src/users/guards/googleAuth.guard';
import { UpdateFlightInput } from './dto/update-flight.input';
import { FlightResponse } from './dto/flight.response.dto';
import { FlightFilterDto } from './dto/filter-flight.input.dto';
import { FlightPaginationResponse } from './dto/Flight-pagination-respnse.dto';
import { AdminGuard } from 'src/users/guards/adminAuth.guard';
import { currentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { StaffService } from './staff.service';
import { FlightAssign } from './dto/assign-flight.input';
import { rolesRestrict } from './guards/roles.restrict.guard';
import { Role } from 'src/users/enums/roles';

@Resolver(() => Flight)
export class FlightResolver {
  constructor(
    private readonly flightService: FlightService,
    private readonly staffService: StaffService,
  ) {}

  // Restrict this action to ADMIN AND CREW
  @UseGuards(
    new allAuthGuard([new authGuard(), new GoogleAuthGuard()]),
    FlightRestrict,
  )
  @Mutation(() => Flight)
  createFlight(
    @Args('CreateFlightInput') CreateFlightInput: CreateFlightInput,
    @Context() context: any,
  ) {
    return this.flightService.createFlight(CreateFlightInput);
  }

  @UseGuards(
    new allAuthGuard([new authGuard(), new GoogleAuthGuard()]),
    FlightRestrict,
  )
  @Mutation(() => Flight)
  updateFlight(
    @Args('id') id: string,
    @Args('UpdateFlightInput') updateFlight: UpdateFlightInput,
    @Context() context: any,
  ) {
    return this.flightService.updateFlight(id, updateFlight);
  }

  @UseGuards(
    new allAuthGuard([new authGuard(), new GoogleAuthGuard()]),
    FlightRestrict,
  )
  @Mutation(() => FlightResponse)
  removeFlight(@Args('id') id: string) {
    return this.flightService.cancelFlight(id);
  }

  @Query(() => FlightPaginationResponse)
  async flights(@Args('flightFilter') flightFilterInput: FlightFilterDto) {
    return await this.flightService.retriveFlights(flightFilterInput);
  }

  @Mutation(() => Flight)
  @UseGuards(AdminGuard)
  async assignFlight(@Args('assignflight') assignBody: FlightAssign) {
    return await this.staffService.assignFlightTo(assignBody);
  }

  @Mutation(() => Flight)
  @UseGuards(AdminGuard)
  async unAssignFlight(@Args('assignflight') assignBody: FlightAssign) {
    return await this.staffService.removeStaffFromFlight(assignBody);
  }

  @UseGuards(
    new allAuthGuard([new authGuard(), new GoogleAuthGuard()]),
    FlightRestrict,
  )
  @Query(() => [Flight])
  @UseGuards(rolesRestrict(Role.CREW, Role.SECURITY))
  async myAssignedFlights(@currentUser() user: string) {
    return await this.staffService.myAssignedFlights(user);
  }
}
