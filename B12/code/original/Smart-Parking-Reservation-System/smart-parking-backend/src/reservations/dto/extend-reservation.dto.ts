import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ExtendReservationDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  additionalMinutes!: number;
}
