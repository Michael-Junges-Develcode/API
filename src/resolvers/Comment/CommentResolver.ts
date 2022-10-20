import { verify } from "jsonwebtoken";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../../context/context";
import { Comment } from "../../dtos/models/Comment/Comment";

@Resolver()
export class CommentResolver {
  @Query(() => [Comment])
  @Authorized()
  async getComments(@Arg("postId") postId: number, @Ctx() ctx: Context) {
    const comments = await ctx.prisma.comments.findMany({
      where: { postsId: postId },
      include: { author: true },
    });

    return comments;
  }

  @Mutation(() => Comment)
  @Authorized()
  async createComment(
    @Arg("postId") postId: number,
    @Arg("content") content: string,
    @Arg("authorId") authorId: string,
    @Ctx() ctx: Context
  ) {
    const createdComment = await ctx.prisma.comments.create({
      data: {
        comment: content,
        author: { connect: { id: authorId } },
        post: { connect: { id: postId } },
      },
    });
    const comment = await ctx.prisma.comments.findUnique({
      where: { id: createdComment.id },
      include: { author: true, post: { include: { author: true } } },
    });
    return comment;
  }

  @Mutation(() => String)
  @Authorized()
  async deleteComment(@Arg("commentId") commentId: number, @Ctx() ctx: Context) {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = ctx.token;
    const user = verify(token, secret!).id;

    const comment = await ctx.prisma.comments.findUnique({
      include: { author: true },
      where: { id: commentId },
    });
    if (!comment) throw new Error("This comment doesn't exist");
    if (comment?.authorId === user) {
      await ctx.prisma.comments.delete({
        where: { id: commentId },
      });
      return `Successfully deleted comment ${commentId}`;
    } else
      return "Unauthorized delete attempt, informed user is not this comment's author";
  }
}
