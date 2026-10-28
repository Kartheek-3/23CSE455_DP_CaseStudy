import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateParkingAreaDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerHour?: number;
}
