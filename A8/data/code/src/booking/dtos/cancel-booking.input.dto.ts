import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CancelBooking {
  @IsString()
  @Field({ nullable: false })
  bookingId: string;
}
