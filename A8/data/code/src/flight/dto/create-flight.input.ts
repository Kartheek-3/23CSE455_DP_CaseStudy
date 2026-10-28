import { InputType, Int, Field } from '@nestjs/graphql';
import {
  IsDate,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsTimeZone,
  Matches,
} from 'class-validator';

@InputType()
export class CreateFlightInput {
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Example field (placeholder)' })
  flightNumber: number;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  departureAirport: string;

  @IsString()
  @Field(() => String)
  @IsNotEmpty()
  destinationAirport: string;

  @IsDateString()
  @IsNotEmpty()
  @Field(() => String)
  date: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?([+-](0\d|1\d|2[0-3]))$/, {
    message: 'Time must be valid. Example: 10:30:00+02',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  departureTime: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?([+-](0\d|1\d|2[0-3]))$/, {
    message: 'Time must be valid. Example: 10:30:00+02',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  arrivalTime: string;

  @IsString()
  @Field(() => String)
  airLine: string;

  @IsInt()
  @IsNotEmpty()
  @Field(() => Int)
  availableSeats: number;
}
