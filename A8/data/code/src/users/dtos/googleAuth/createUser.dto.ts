import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';

@InputType()
export class userDetail {
  @Field(() => String)
  @IsString()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  displayName: string;
}
