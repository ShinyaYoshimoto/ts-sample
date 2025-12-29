import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

const main = async () => {
  await Promise.all([
    prisma.member.create({
      data: {
        name: '注文者サンプル',
      },
    }),
    prisma.administrator.create({
      data: {
        name: '管理者サンプル',
      },
    }),
  ]);
};

main();
