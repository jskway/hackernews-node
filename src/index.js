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

// Prisma Client exposes a CRUD API for the models in your data model
// for you to read and write in your database.  These methods are auto-generated
// based on your model definitions in schema.prisma
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
  // This function is called with every request, so you can set the context
  // based on the request's details
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
