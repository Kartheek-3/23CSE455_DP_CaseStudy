import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { VehicleType } from '../reservation.entity';

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty()
  slotId!: number;

  @IsDateString()
  @IsNotEmpty()
  startTime!: string;

  @IsDateString()
  @IsNotEmpty()
  endTime!: string;

  @IsString()
  @IsNotEmpty()
  vehicleNumber!: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(VehicleType)
  @IsOptional()
  vehicleType?: VehicleType;
}
