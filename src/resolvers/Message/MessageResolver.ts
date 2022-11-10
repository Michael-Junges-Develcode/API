import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Field,
  InputType,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { Context } from "../../context/context";
import { Message } from "../../dtos/models/Message/Message";

@InputType()
class MessageInput {
  @Field()
  senderId: string;

  @Field()
  receiverId: string;

  @Field()
  text: string;
}

@Resolver()
export class MessageResolver {
  @Query(() => [Message])
  @Authorized()
  async getAllMessagesSent(
    @Arg("userId") senderId: string,
    @Ctx() ctx: Context
  ): Promise<Message[] | null> {
    const messages = await ctx.prisma.messages.findMany({
      where: { senderId },
    });
    if (!messages) return null;

    return messages;
  }

  @Mutation(() => Message)
  @Authorized()
  async sendMessage(
    @Arg("data") data: MessageInput,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine
  ) {
    const message = await ctx.prisma.messages.create({
      data: {
        text: data.text,
        sender: { connect: { id: data.senderId } },
        receiver: { connect: { id: data.receiverId } },
      },
    });
    await pubSub.publish("MESSAGES", message);
    return message;
  }

  @Subscription({
    topics: "MESSAGES"
  })
  messageNotification(@Root() messagePayload: Message): Message {
    console.log(messagePayload);
    return {
      ...messagePayload
    };
  }
}
