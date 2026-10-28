import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsString, ValidateIf } from 'class-validator';
import { Role } from '../enums/roles';

@InputType()
export class CreateUserInput {
  @Field(() => Role)
  @IsEnum(Role)
  role: Role;

  @Field(() => String, { nullable: false })
  @IsString()
  firstName: string;

  @Field(() => String, { nullable: true })
  @IsString()
  lastName: string;

  @Field()
  @IsString()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;

  // additional details for passenger
  @ValidateIf((o) => o.role === Role.USER)
  @Field(() => String, { nullable: false })
  passportId: string | null;

  @ValidateIf((o) => [Role.CREW, Role.SECURITY, Role.USER].includes(o.role))
  @Field(() => String, { nullable: false })
  nationality: string | null;

  // Additional details for stuff
  @ValidateIf((o) => [Role.CREW, Role.SECURITY].includes(o.role))
  @Field(() => String, { nullable: true })
  employeeID: string | null;
}
