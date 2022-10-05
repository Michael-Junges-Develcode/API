import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class Token {
  @Field(() => ID)
  id: string;

  @Field()
  token: string;

  @Field({nullable: true})
  user?: string;

  @Field()
  usersId: string;
}
