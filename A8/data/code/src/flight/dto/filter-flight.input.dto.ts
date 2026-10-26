import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class FlightFilterDto {
  // Pagination filtering
  @Field(() => Int, { defaultValue: 1, nullable: false })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 10, nullable: false })
  @IsInt()
  @Min(1)
  limit: number;

  // Flight params filtering
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  departureTime: string;

  @Field({ nullable: false, description: 'Filter by destination airport code' })
  @IsOptional()
  @IsString()
  destinationAirport?: string;

  @Field({ nullable: false })
  @IsOptional()
  @IsString()
  departureAirport?: string;

  @Field({ nullable: true, description: 'Filter by airline name' })
  @IsOptional()
  @IsString()
  airLine?: string;

  @Field({
    nullable: false,
    description: 'Filter by departure date (YYYY-MM-DD)',
  })
  @IsDateString()
  date?: string;
}
