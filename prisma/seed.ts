import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const scheduled = await prisma.eventStatus.upsert({
    where: { id: 1},
    update: {},
    create: {
      id: 1,
      Status: 'Scheduled',
    },
  });
  const inProgress = await prisma.eventStatus.upsert({
    where: { id: 2},
    update: {},
    create: {
      id: 2,
      Status: 'In Progress',
    },
  });
  const completed = await prisma.eventStatus.upsert({
    where: { id: 3},
    update: {},
    create: {
      id: 3,
      Status: 'Completed',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  })