import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSeatInput } from 'src/seat/dtos/create-seat.dto';

@InputType()
export class UpdateBooking {
  @Field()
  @IsString()
  bookingId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  flightId?: string;

  @Field(() => [CreateSeatInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSeatInput)
  seats?: CreateSeatInput[];
}
