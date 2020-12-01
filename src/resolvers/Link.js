// This resolver needs to be called `postedBy` because it resolves the
// `postedBy` field from the Link type in schema.graphql
function postedBy(parent, args, context) {
  return context.prisma.link
    .findUnique({
      where: { id: parent.id },
    })
    .postedBy();
}

function votes(parent, args, context) {
  return context.prisma.link
    .findUnique({
      where: { id: parent.id },
    })
    .votes();
}

module.exports = {
  postedBy,
  votes,
};
