const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET } = require("../utils");

async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10);

  const user = await context.prisma.user.create({
    data: { ...args, password },
  });

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
}

async function login(parent, args, context, info) {
  const user = await context.prisma.user.findUnique({
    where: { email: args.email },
  });
  if (!user) {
    throw new Error("No such user found");
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
}

async function post(parent, args, context, info) {
  const { userId } = context;

  const newLink = await context.prisma.link.create({
    data: {
      description: args.description,
      url: args.url,
      postedBy: { connect: { id: userId } },
    },
  });
  context.pubsub.publish("NEW_LINK", newLink);

  return newLink;
}

async function updateLink(parent, args, context, info) {
  const { userId } = context;

  const Link = await context.prisma.link.findUnique({
    where: {
      id: Number(args.id),
    },
  });

  if (Link.postedById !== userId) {
    throw new Error("Not authorized to update this Link");
  }

  const updatedLink = await context.prisma.link.update({
    where: {
      id: Number(args.id),
    },
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } },
    },
  });

  return updatedLink;
}

async function deleteLink(parent, args, context, info) {
  const { userId } = context;

  const Link = await context.prisma.link.findUnique({
    where: {
      id: Number(args.id),
    },
  });

  if (Link.postedById !== userId) {
    throw new Error("Not authorized to delete this Link");
  }

  const deletedLink = await context.prisma.link.delete({
    where: {
      id: Number(args.id),
    },
  });
  return deletedLink;
}

async function vote(parent, args, context, info) {
  const { userId } = context;

  const vote = await context.prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId: userId,
      },
    },
  });

  if (Boolean(vote)) {
    throw new Error(`Already voted for link: ${args.linkId}`);
  }

  const newVote = context.prisma.vote.create({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: Number(args.linkId) } },
    },
  });
  context.pubsub.publish("NEW_VOTE", newVote);

  return newVote;
}

module.exports = {
  signup,
  login,
  post,
  updateLink,
  deleteLink,
  vote,
};
