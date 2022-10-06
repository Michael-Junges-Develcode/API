import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import path from "node:path";
import { UserResolver } from "./resolvers/User/UserResolver";
import AuthenticationAssurance from "./context/AuthenticationAssurance";
import { TokenResolver } from "./resolvers/Token/TokenResolver";
import express from "express";
import http from "http";
import { context } from "./context/context";
import { MessageResolver } from "./resolvers/Message/MessageResolver";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

async function main() {
  const schema = await buildSchema({
    resolvers: [UserResolver, TokenResolver, MessageResolver],
    authChecker: AuthenticationAssurance,
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
  });

  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const prisma = context.prisma;
      const ctx = { req, token: req?.headers?.authorization, prisma };
      return ctx;
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await server.start();
  server.applyMiddleware({
    app,
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

main();
