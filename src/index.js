// Config .env vars
require("dotenv").config();

const { ApolloServer, PubSub } = require("apollo-server");
const { PrismaClient } = require("@prisma/client");

// Resolvers
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const User = require("./resolvers/User");
const Link = require("./resolvers/Link");
const Vote = require("./resolvers/Vote");
const Subscription = require("./resolvers/Subscription");

const fs = require("fs");
const path = require("path");

const { getUserId } = require("./utils");

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

// The schema and resolvers are bundled and passed to the `ApolloServer`.  This
// tells the server what API operations are accepted and how they should be
// resolved.
// We're also attaching an instance of PrismaClient (as prisma) to the context
// object, which allows us to access context.prisma in all of our resolvers
const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8"),
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      prisma,
      pubsub,
      userId: req && req.headers.authorization ? getUserId(req) : null,
    };
  },
  subscriptions: {
    onConnect: (connectionParams) => {
      if (connectionParams.authToken) {
        return {
          prisma,
          userId: getUserId(null, connectionParams.authToken),
        };
      } else {
        return {
          prisma,
        };
      }
    },
  },
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
