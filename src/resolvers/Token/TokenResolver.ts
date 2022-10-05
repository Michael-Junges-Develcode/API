import { Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Context } from "../../context/context";
import { Token } from "../../dtos/models/Token/Token";

@Resolver()
export class TokenResolver {
  @Query(() => [Token])
  @Authorized()
  async getActiveTokens(@Ctx() ctx: Context): Promise<Token[] | null> {
    const tokens = await ctx.prisma.tokens.findMany();
    if (!tokens) return null;

    return tokens;
  }
}
