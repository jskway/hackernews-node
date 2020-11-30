const { GraphQLServer } = require("graphql-yoga");
const { PrismaClient } = require("@prisma/client");

// Creating an instance of our auto-generated query builder
const prisma = new PrismaClient();

// The `resolvers` object is the actual implementation of the GraphQL Schema
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async (parent, args, context) => {
      return context.prisma.link.findMany();
    },
    link: async (parent, args, context) => {
      return context.prisma.link.findUnique({
        where: {
          id: Number(args.id),
        },
      });
    },
  },
  Mutation: {
    post: async (parent, args, context, info) => {
      const newLink = await context.prisma.link.create({
        data: {
          description: args.description,
          url: args.url,
        },
      });
      return newLink;
    },
    updateLink: async (parent, args, context, info) => {
      const updatedLink = await context.prisma.link.update({
        where: { id: Number(args.id) },
        data: {
          url: args.url,
          description: args.description,
        },
      });

      return updatedLink;
    },
    deleteLink: async (parent, args, context, info) => {
      const deletedLink = await context.prisma.link.delete({
        where: { id: Number(args.id) },
      });

      return deletedLink;
    },
  },
};

// The schema and resolvers are bundled and passed to the `GraphQLServer`.  This
// tells the server what API operations are accepted and how they should be
// resolved.
// We're also attaching an instance of PrismaClient (as prisma) to the context
// object, which allows us to access context.prisma in all of our resolvers
const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: {
    prisma,
  },
});

server.start(() => console.log(`Server is running on http://localhost:4000`));
