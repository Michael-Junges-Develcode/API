import { Field, ID, ObjectType } from "type-graphql";
import { Post } from "../Post/Post";
import { User } from "../User/User";

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: number;

  @Field()
  comment: string;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field(() => Post, { nullable: true })
  post?: Post;

  @Field(() => Date)
  createdAt: Date;
}
