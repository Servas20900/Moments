import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.paquete.findMany({
    where: { nombre: { in: ['Especial', 'Memory', 'Prime'] } },
    select: { nombre: true, incluidos: true },
    orderBy: { nombre: 'asc' },
  });

  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
