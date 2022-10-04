import { IsEmail } from "class-validator";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Context } from "../../context/context";
import { User } from "../../dtos/models/User/User";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { AuthenticatedUser } from "../../dtos/models/Token/Token";

@InputType()
class UserSignUp {
  @Field()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;
}

@InputType()
class UserLogIn {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async privateInfo(
    @Arg("token") token: string,
    @Ctx() ctx: Context
  ): Promise<User | null> {
    const dbToken = await ctx.prisma.tokens.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!dbToken) return null;

    return dbToken.user;
  }

  @Query(() => User, { nullable: true })
  async findUserById(
    @Arg("id") id: string,
    @Ctx() ctx: Context
  ): Promise<User | null> {
    const user = await ctx.prisma.users.findUnique({
      where: { id },
    });
    if (!user) return null;

    return user;
  }

  @Query(() => [User], { nullable: true })
  async findAllUsers(
    @Arg("page") page: number,
    @Ctx() ctx: Context
  ): Promise<User[] | null> {
    const users = await ctx.prisma.users.findMany();
    if (!users) return null;
    console.log(users);
    return users;
  }

  @Mutation(() => User)
  async signUp(
    @Arg("data") data: UserSignUp,
    @Ctx() ctx: Context
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return ctx.prisma.users.create({
      data: { ...data, password: hashedPassword },
    });
  }

  @Mutation(() => User, { nullable: true })
  async logIn(@Arg("data") data: UserLogIn, @Ctx() ctx: Context) {
    const user = await ctx.prisma.users.findUnique({
      where: { email: data.email },
    });

    if (!user) return null;

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const isValid = await bcrypt.compare(hashedPassword, user.password);
    console.log(isValid)

    if (!isValid) return null;

    const generatedToken = uuid();

    const newToken = await ctx.prisma.tokens.create({
      data: { token: generatedToken, user: { connect: { id: user.id } } },
    });

    return user;
  }
}