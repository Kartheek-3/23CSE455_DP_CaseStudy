import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class resetPasswordDto {
  @Field()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
