import { registerEnumType } from '@nestjs/graphql';

export enum SeatClass {
  FIRST = 'FIRST',
  BUSINESS = 'BUSINESS',
  ECONOMY = 'ECONOMY',
}

registerEnumType(SeatClass, {
  name: 'SeatClass',
  description: 'Cabin seat class categorization',
});
