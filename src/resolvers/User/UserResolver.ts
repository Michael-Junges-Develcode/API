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
import { sign, verify } from "jsonwebtoken";
import { Token } from "../../dtos/models/Token/Token";
import { PrismaClientUnknownRequestError } from "@prisma/client/runtime";

@InputType()
class UserSignUp {
  @Field({ nullable: true })
  name?: string;

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
  async auth(
    @Arg("token") token: string,
    @Ctx() ctx: Context
  ): Promise<User | null> {
    const dbToken = await ctx.prisma.tokens.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!dbToken) return null;
    const user = dbToken.user;

    return {
      id: user.id,
      name: user.name ?? undefined,
      email: user.email,
      photoUrl: user.photoUrl ?? undefined,
      createdAt: user.createdAt,
    };
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

    return {
      id: user.id,
      name: user.name ?? undefined,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  @Query(() => [User], { nullable: true })
  async findAllUsers(
    @Arg("page") page: number,
    @Ctx() ctx: Context
  ): Promise<User[] | null> {
    const users = await ctx.prisma.users.findMany();
    if (!users) return null;
    console.log(users);
    const rearrangedUsers = users.map((users) => {
      return {
        id: users.id,
        name: users.name ?? undefined,
        createdAt: users.createdAt,
        email: users.email,
      };
    });
    return rearrangedUsers;
  }

  @Mutation(() => User)
  async signUp(
    @Arg("data") data: UserSignUp,
    @Ctx() ctx: Context
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const createdUser = await ctx.prisma.users.create({
      data: { ...data, password: hashedPassword },
    });
    return {
      id: createdUser.id,
      name: createdUser.name ?? undefined,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
    };
  }

  @Mutation(() => Token, { nullable: true })
  async logIn(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: Context
  ) {
    const user = await ctx.prisma.users.findUnique({
      where: { email: email },
    });

    if (!user) throw new Error("Incorrect email/password combination");

    const isValid = await bcrypt.compare(password, user.password);
    console.log(isValid);

    if (isValid === false)
      throw new Error("Incorrect email/password combination");

    const generatedToken = sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        subject: `"${user.id}"`,
        expiresIn: "1d",
      }
    );

    const signedUser = await ctx.prisma.tokens.create({
      data: { token: generatedToken, user: { connect: { id: user.id } } },
    });

    const dbToken = await ctx.prisma.tokens.findUnique({
      where: { token: signedUser.token },
      include: { user: true },
    });

    return dbToken;
  }

  @Mutation(() => User)
  async updateProfilePhoto(
    @Arg("photoUrl") photoUrl: string,
    @Ctx() ctx: Context
  ): Promise<User | unknown> {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = ctx.token;
    const userId = verify(token, secret!).id;
    try {
      await ctx.prisma.users.update({
        where: { id: userId },
        data: { photoUrl: photoUrl },
      });
      const updatedUser = await ctx.prisma.users.findUnique({
        where: { id: userId },
      });
      return {
        id: updatedUser!.id,
        name: updatedUser?.name ?? undefined,
        email: updatedUser!.email,
        createdAt: updatedUser!.createdAt,
        photoUrl: updatedUser?.photoUrl ?? undefined,
      };
    } catch (err) {
      return err
    }
  }
}
