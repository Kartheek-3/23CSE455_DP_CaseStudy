import { registerEnumType } from '@nestjs/graphql';

export enum FlightStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
}

registerEnumType(FlightStatus, {
  name: 'FlightStatus',
  description: 'Authoritative operational status of the flight',
});
