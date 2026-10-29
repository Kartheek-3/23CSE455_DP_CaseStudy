import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class forgetPasswordDto {
  @Field()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}
