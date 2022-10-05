import { ApolloServer } from "apollo-server";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import path from "node:path";
import { UserResolver } from "./resolvers/User/UserResolver";
import AuthenticationAssurance from "./context/AuthenticationAssurance";
import { TokenResolver } from "./resolvers/Token/TokenResolver";
import { PrismaClient } from "@prisma/client";
import { context } from "./context/context";

async function main() {
  const schema = await buildSchema({
    resolvers: [UserResolver, TokenResolver],
    authChecker: AuthenticationAssurance,
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
  });

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const prisma = context.prisma
      const ctx = { req, token: req?.headers?.authorization, prisma };
      return ctx;
    },
  });

  const { url } = await server.listen();

  console.log(`HTTP server started on ${url}`);
}

main();
