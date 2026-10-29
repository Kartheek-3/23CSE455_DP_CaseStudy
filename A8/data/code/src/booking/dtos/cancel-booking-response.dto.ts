import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class responseMessage {
  @Field()
  message: string;
}
