import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INCLUDED_BY_PACKAGE: Record<string, string[]> = {
  Prime: ['Bebidas', 'Snacks'],
  Gold: ['Bebidas', 'Snacks', 'Fotógrafo profesional'],
  Ride: ['Transporte', 'Snacks', 'Bebidas', 'Descuento exclusivo en Psycho e Insania'],
  Luxor: ['Transporte', 'Bebidas', 'Snacks', 'Parqueo', 'Descuento en eventos Insania y Psycho'],
  Especial: ['Transporte', 'Champagne o bebidas premium', 'Copas grabadas', 'Ramo de flores', 'Carta personalizada', 'Chocolates'],
  Memory: ['Transporte', 'Bebidas', 'Copas', 'Vasos grabados', 'Ramo de flores', 'Carta personalizada', 'Chocolates'],
  Infinity: ['Transporte', 'Bebidas', 'Snacks'],
  Premium: ['Transporte', 'Bebidas', 'Snacks', 'Fotógrafo profesional'],
  Platinum: ['Transporte', 'Bebidas', 'Snacks'],
  Exclusive: ['Transporte', 'Bebidas', 'Snacks'],
  'Minibús GAM': ['Bebidas', 'Snacks'],
  'Minibús Out GAM': ['Bebidas', 'Snacks'],
};

async function main() {
  console.log('Iniciando backfill de incluidos por nombre de paquete...');

  const paquetes = await prisma.paquete.findMany({
    select: { id: true, nombre: true, incluidos: true },
  });

  const candidates = paquetes.filter((pkg) => {
    const hasTemplate = Boolean(INCLUDED_BY_PACKAGE[pkg.nombre]);
    const isEmpty = !Array.isArray(pkg.incluidos) || pkg.incluidos.length === 0;
    return hasTemplate && isEmpty;
  });

  if (candidates.length === 0) {
    console.log('No hay paquetes que requieran backfill.');
    return;
  }

  let updated = 0;
  for (const pkg of candidates) {
    const incluidos = INCLUDED_BY_PACKAGE[pkg.nombre];
    if (!incluidos?.length) continue;

    await prisma.paquete.update({
      where: { id: pkg.id },
      data: { incluidos },
    });

    updated += 1;
    console.log(`✔ Actualizado: ${pkg.nombre}`);
  }

  console.log(`Backfill finalizado. Paquetes actualizados: ${updated}`);
}

main()
  .catch((error) => {
    console.error('Error en backfill incluidos:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
