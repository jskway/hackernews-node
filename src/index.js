const { GraphQLServer } = require("graphql-yoga");

// Dummy data
let links = [
  {
    id: "link-0",
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
];

let idCount = links.length;
// the `resolvers` object is the actual implementation of the GraphQL Schema
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: () => links,
    link: (parent, args) => links.find((link) => link.id === args.id),
  },
  Mutation: {
    post: (parent, args) => {
      const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      };

      links.push(link);
      return link;
    },
    updateLink: (parent, args) => {
      const linkIdx = links.findIndex((link) => link.id === args.id);

      if (linkIdx === -1) {
        return undefined;
      }

      links[linkIdx].url = args.url;
      links[linkIdx].description = args.description;

      return links[linkIdx];
    },
    deleteLink: (parent, args) => {
      const linkIdx = links.findIndex((link) => link.id === args.id);

      if (linkIdx === -1) {
        return undefined;
      }

      const deletedLink = links.splice(linkIdx, 1);
      return deletedLink[0];
    },
  },
};

// The schema and resolvers are bundled and passed to the `GraphQLServer`.  This
// tells the server what API operations are accepted and how they should be
// resolved.
const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
});

server.start(() => console.log(`Server is running on http://localhost:4000`));
