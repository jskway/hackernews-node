function info() {
  return `This is the API of a Hackernews Clone`;
}

// The `parent` arg is the result of the previous resolver execution level.
// GraphQL queries can be nested.  Each level of nesting corresponds to
// one resolver execution level.
async function feed(parent, args, context, info) {
  // If no `filter` string is provided, then `where` will just be an empty
  // object
  const where = args.filter
    ? {
        OR: [
          { description: { contains: args.filter } },
          { url: { contains: args.filter } },
        ],
      }
    : {};

  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
  });

  const count = await context.prisma.link.count({ where });

  return {
    links,
    count,
  };
}

function link(parent, args, context, info) {
  return context.prisma.link.findUnique({
    where: {
      id: Number(args.id),
    },
  });
}

module.exports = {
  info,
  feed,
  link,
};
