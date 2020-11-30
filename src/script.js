const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Async function to send queries to the db
async function main() {
  // you will write your Prisma Client queries here

  const newLink = await prisma.link.create({
    data: {
      description: "Fullstack tutorial for GraphQL",
      url: "www.howtographql.com",
    },
  });

  const allLinks = await prisma.link.findMany();
  console.log(allLinks);
}

main()
  .catch((e) => {
    throw e;
  })
  // Close the db connections when the script terminates
  .finally(async () => {
    await prisma.$disconnect();
  });
