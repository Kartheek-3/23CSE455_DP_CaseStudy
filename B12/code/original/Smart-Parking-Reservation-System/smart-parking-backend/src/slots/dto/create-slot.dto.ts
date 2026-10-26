import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { SlotType } from '../slot.entity';

export class CreateSlotDto {
  @IsString()
  @IsNotEmpty()
  slotNumber!: string;

  @IsString()
  @IsOptional()
  section?: string;

  @IsEnum(SlotType)
  @IsOptional()
  type?: SlotType;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  parkingAreaId!: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  floor?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pricePerHour?: number;
}
