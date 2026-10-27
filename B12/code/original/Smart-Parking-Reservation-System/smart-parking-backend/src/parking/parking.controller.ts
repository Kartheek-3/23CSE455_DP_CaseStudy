import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { ParkingService } from './parking.service';
import { CreateParkingAreaDto } from './dto/create-parking-area.dto';
import { UpdateParkingAreaDto } from './dto/update-parking-area.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('parking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createParkingAreaDto: CreateParkingAreaDto) {
    return this.parkingService.create(createParkingAreaDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.parkingService.findAll(
      search,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: UpdateParkingAreaDto) {
    return this.parkingService.update(+id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parkingService.remove(+id);
  }
}
