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
        comments: true,
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
        comments: true,
      },
    });
    return posts;
  }

  @Mutation(() => Post)
  @Authorized()
  async createPost(
    @Arg("content") content: string,
    @Arg("author") author: string,

    @Ctx() ctx: Context
  ) {
    const createdPost = await ctx.prisma.posts.create({
      data: { content: content, author: { connect: { id: author } } },
    });
    const post = await ctx.prisma.posts.findUnique({
      where: { id: createdPost.id },
      include: { author: true, comments: true },
    });
    return post;
  }
}
