import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FlightResponse {
  @Field()
  message: string;
}
