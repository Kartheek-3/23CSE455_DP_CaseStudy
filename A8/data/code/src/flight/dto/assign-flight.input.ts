import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class FlightAssign {
  @Field({ nullable: false })
  @IsString()
  flightId: string;

  @Field({ nullable: false })
  @IsString()
  userId: string;
}
