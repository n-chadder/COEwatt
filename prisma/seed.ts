import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    let EventStatusData = await generateEventStatusData();
    let WCAGStatusData = await generateWCAGStatusData();
  }
  catch (e: any) {
    console.log(e);
    return false;
  }
  return true;
}

async function generateEventStatusData() {
  try {
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
  catch (e: any) {
    throw e;
  }
  return true;
}

async function generateWCAGStatusData() {
  try{
    const Compliant = await prisma.wCAGStatus.upsert({
      where: { id: 1},
      update: {},
      create: {
        id: 1,
        Status: "Compliant"
      },
    });
    const NonCompliant = await prisma.wCAGStatus.upsert({
      where: { id: 2},
      update: {},
      create: {
        id: 2,
        Status: "NonCompliant",
      },
    });
    const Unknown = await prisma.wCAGStatus.upsert({
      where: { id: 3},
      update: {},
      create: {
        id: 3,
        Status: "Unknown",
      },
    });
  }
  catch (e: any) {
    throw e;
  }
  return true;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  })