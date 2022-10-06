import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class Message {
  @Field((type) => ID)
  id: string;

  @Field()
  text: string;

  @Field()
  senderId: string;

  @Field()
  receiverId: string;

  @Field((type) => Date)
  createdAt: Date;
}
