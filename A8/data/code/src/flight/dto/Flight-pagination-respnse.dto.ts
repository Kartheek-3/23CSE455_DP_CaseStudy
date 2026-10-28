import { Field, ObjectType } from '@nestjs/graphql';
import { Flight } from '../entities/flight.entity';

@ObjectType()
export class FlightPaginationResponse {
  @Field(() => [Flight], { nullable: true })
  flights: Flight[];

  @Field()
  total: number;

  @Field()
  lastPage: number;

  @Field()
  currentPage: number;

  @Field()
  perPage: number;
}
