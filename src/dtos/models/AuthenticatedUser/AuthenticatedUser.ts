import { Field, ObjectType } from "type-graphql";
import { User } from "../User/User";

@ObjectType()
export class AuthenticatedUser extends User {
  @Field({ nullable: true })
  token?: string;
}
