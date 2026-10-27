import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { SlotStatus } from './slot.entity';

@Controller('slots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createSlotDto: CreateSlotDto) {
    return this.slotsService.create(createSlotDto);
  }

  @Get()
  findAll(
    @Query('parkingAreaId') parkingAreaId?: string,
    @Query('status') status?: SlotStatus,
  ) {
    return this.slotsService.findAll(
      parkingAreaId ? +parkingAreaId : undefined,
      status,
    );
  }

  @Get('available/:parkingAreaId')
  findAvailable(
    @Param('parkingAreaId') parkingAreaId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    if (!startTime || !endTime) {
      throw new BadRequestException('startTime and endTime are required');
    }
    return this.slotsService.findAvailableByParkingArea(
      +parkingAreaId,
      new Date(startTime),
      new Date(endTime),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: UpdateSlotDto) {
    return this.slotsService.update(+id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.slotsService.remove(+id);
  }
}
