import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class UpdateBooking {
  @Field()
  @IsString()
  flight: string;

  @Field()
  @IsString()
  seat: string;
}
