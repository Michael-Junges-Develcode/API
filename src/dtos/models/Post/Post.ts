import { Field, ID, ObjectType } from "type-graphql";
import { Comment } from "../Comment/Comment";
import { User } from "../User/User";

@ObjectType()
export class Post {
  @Field(() => ID)
  id: number;

  @Field()
  content: string;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field(() => Comment, { nullable: true })
  comments?: Comment;

  @Field(() => Date)
  createdAt: Date;
}
