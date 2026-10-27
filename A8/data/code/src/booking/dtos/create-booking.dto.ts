import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Flight } from 'src/flight/entities/flight.entity';
import { CreateSeatInput } from 'src/seat/dtos/create-seat.dto';
import { Seat } from 'src/seat/entities/seat.entity';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreateBooking {
  @Field(() => [CreateSeatInput])
  @IsArray()
  @ValidateNested({ each: true }) // to validate every seat
  @Type(() => CreateSeatInput)
  seats: CreateSeatInput[];
}
