import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  CREW = 'CREW',
  SECURITY = 'SECURITY',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'Available user roles',
});
