import { Field, ID, ObjectType } from "type-graphql";
import { User } from "../User/User";

@ObjectType()
export class Token {
  @Field(() => ID)
  id: string;

  @Field()
  token: string;

  @Field(() => User, {nullable: true})
  user?: User;

  @Field()
  usersId: string;
}
