import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class forgetPasswordResponse {
  @Field(() => String)
  message: string;
}
