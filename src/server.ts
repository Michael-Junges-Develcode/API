import { ApolloServer } from "apollo-server";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import path from "node:path";
import { context } from "./context/context";
import { UserResolver } from "./resolvers/User/UserResolver";

async function main() {
  const schema = await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
  });

  const server = new ApolloServer({ schema, context });

  const { url } = await server.listen();

  console.log(`HTTP server started on ${url}`);
}

main();
