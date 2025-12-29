import { PrismaClient } from './generated/prisma';

// Prismaの基本的な使い方サンプル
const prisma = new PrismaClient();

async function createUser() {
  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
    },
  });
  console.log(user);
}

async function createUserWithPost() {
  const user = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@prisma.io',
      posts: {
        create: [
          {
            title: 'Hello World',
            published: true,
          },
          {
            title: 'My second post',
            content: 'This is still a draft',
          },
        ],
      },
    },
  });
  console.log(user);
}

async function listUsers() {
  const users = await prisma.user.findMany();
  console.log(users);
}

async function listPosts() {
  const posts = await prisma.post.findMany();
  console.log(posts);
}

async function listUsersWithPosts() {
  const users = await prisma.user.findMany({
    include: { posts: true },
  });
  console.log(users);
}

// createUser()
// listUsers()
// createUserWithPost()
// listUsersWithPosts()
listUsersWithPosts()
.then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
