// Config .env vars
require("dotenv").config();

const { GraphQLServer, PubSub } = require("graphql-yoga");
const { PrismaClient } = require("@prisma/client");

// Resolvers
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const User = require("./resolvers/User");
const Link = require("./resolvers/Link");
const Vote = require("./resolvers/Vote");
const Subscription = require("./resolvers/Subscription");

// Creating an instance of our auto-generated query builder
const prisma = new PrismaClient();

const pubsub = new PubSub();

// The `resolvers` object is the actual implementation of the GraphQL Schema
const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
  Vote,
};

// The schema and resolvers are bundled and passed to the `GraphQLServer`.  This
// tells the server what API operations are accepted and how they should be
// resolved.
// We're also attaching an instance of PrismaClient (as prisma) to the context
// object, which allows us to access context.prisma in all of our resolvers
const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: (request) => {
    return {
      ...request,
      prisma,
      pubsub,
    };
  },
});

server.start(() => console.log(`Server is running on http://localhost:4000`));
