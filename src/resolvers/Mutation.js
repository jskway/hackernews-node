const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");

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
  const user = await context.prisma.user.findOne({
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
  const userId = getUserId(context);

  return context.prisma.link.create({
    data: {
      description: args.description,
      url: args.url,
      postedBy: { connect: { id: userId } },
    },
  });
}

async function updateLink(parent, args, context, info) {
  const userId = getUserId(context);

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
  const userId = getUserId(context);

  const Link = await context.prisma.link.findUnique({
    where: {
      id: Number(args.id),
    },
  });

  if (Link.postedById !== userId) {
    throw new Error("Not authorized to update this Link");
  }

  const deletedLink = await context.prisma.link.delete({
    where: {
      id: Number(args.id),
    },
  });
  return deletedLink;
}

module.exports = {
  signup,
  login,
  post,
  updateLink,
  deleteLink,
};
