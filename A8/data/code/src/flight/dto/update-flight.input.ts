import { InputType, Int, Field, PartialType } from '@nestjs/graphql';
import { CreateFlightInput } from './create-flight.input';

@InputType()
export class UpdateFlightInput extends PartialType(CreateFlightInput) {}
