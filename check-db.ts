
import { PrismaClient } from './backend/node_modules/@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const count = await prisma.retrait.count();
  console.log('Total retraits in DB:', count);
  
  if (count > 0) {
    const first = await prisma.retrait.findFirst();
    console.log('Sample retrait:', first);
  }
  
  await prisma.$disconnect();
}

main();
