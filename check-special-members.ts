
import { PrismaClient } from './backend/node_modules/@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const members = await prisma.membre.findMany({
    where: {
      numeroCompte: {
        in: ['COOP-REVENUS', 'SECTION-0000']
      }
    }
  });
  console.log('Special members found:', members.map((m: any) => m.numeroCompte));
  await prisma.$disconnect();
}

main();
