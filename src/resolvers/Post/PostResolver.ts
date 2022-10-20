import { verify } from "jsonwebtoken";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../../context/context";
import { Post } from "../../dtos/models/Post/Post";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  @Authorized()
  async getAllPosts(@Arg("cursor") cursor: number, @Ctx() ctx: Context) {
    const posts = await ctx.prisma.posts.findMany({
      take: 10,
      cursor: {
        id: cursor,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        author: true,
        comments: { include: { author: true } },
      },
    });
    return posts;
  }

  @Query(() => [Post])
  @Authorized()
  async getFirstPostsPage(@Ctx() ctx: Context) {
    const posts = await ctx.prisma.posts.findMany({
      take: 10,
      orderBy: {
        id: "desc",
      },
      include: {
        author: true,
        comments: { include: { author: true } },
      },
    });
    return posts;
  }

  @Mutation(() => Post)
  @Authorized()
  async createPost(
    @Arg("content") content: string,
    @Arg("authorId") authorId: string,
    @Ctx() ctx: Context
  ) {
    const createdPost = await ctx.prisma.posts.create({
      data: { content: content, author: { connect: { id: authorId } } },
    });
    const post = await ctx.prisma.posts.findUnique({
      where: { id: createdPost.id },
      include: { author: true, comments: true },
    });
    return post;
  }

  @Mutation(() => String)
  @Authorized()
  async deleteOwnPost(@Arg("postId") postId: number, @Ctx() ctx: Context) {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = ctx.token;
    const user = verify(token, secret!).id;

    const post = await ctx.prisma.posts.findUnique({
      include: { author: true },
      where: { id: postId },
    });
    if (!post) throw new Error("This post doesn't exist");
    if (post?.authorId === user) {
      await ctx.prisma.posts.delete({
        where: { id: postId },
      });
      return `Successfully deleted post ${postId}`;
    } else
      return "Unauthorized delete attempt, informed user does not own this post";
  }
}
