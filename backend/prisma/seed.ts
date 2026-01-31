import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional)
  // await prisma.usuario.deleteMany({});
  // await prisma.rol.deleteMany({});

  // 1. Crear roles
  console.log('Creando roles...');
  const rolAdmin = await prisma.rol.upsert({
    where: { codigo: 'ADMIN' },
    update: {},
    create: {
      codigo: 'ADMIN',
      nombre: 'Administrador',
      estado: 'ACTIVO',
    },
  });

  const rolUser = await prisma.rol.upsert({
    where: { codigo: 'USER' },
    update: {},
    create: {
      codigo: 'USER',
      nombre: 'Usuario',
      estado: 'ACTIVO',
    },
  });

  console.log('Roles creados:', { admin: rolAdmin.id, user: rolUser.id });

  // 2. Crear usuario administrador
  console.log('Creando usuario administrador...');
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Moments2026!Secure#Admin';
  if (!process.env.ADMIN_DEFAULT_PASSWORD) {
    console.warn('  ADVERTENCIA: Usando contraseña por defecto para admin. Configura ADMIN_DEFAULT_PASSWORD en .env');
  }
  const hashedPasswordAdmin = await bcrypt.hash(adminPassword, 10);
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@moments.com' },
    update: {
      contrasena: hashedPasswordAdmin,
    },
    create: {
      email: 'admin@moments.com',
      contrasena: hashedPasswordAdmin,
      nombre: 'Administrador Sistema',
      telefono: '88888888',
      estado: 'ACTIVO',
    },
  });

  // Asignar rol admin
  await prisma.usuarioRol.upsert({
    where: {
      usuarioId_rolId: {
        usuarioId: adminUser.id,
        rolId: rolAdmin.id,
      },
    },
    update: {},
    create: {
      usuarioId: adminUser.id,
      rolId: rolAdmin.id,
    },
  });

  console.log('Usuario admin creado:', adminUser.email);

  // 3. Crear categorías de paquetes
  console.log('Creando categorías de paquetes...');
  const categories = [
    { nombre: 'Días Normales', codigo: 'DIAS_NORMALES' },
    { nombre: 'Días de Evento', codigo: 'DIAS_EVENTO' },
    { nombre: 'Ocasión Especial', codigo: 'OCASION_ESPECIAL' },
    { nombre: 'Celebración', codigo: 'CELEBRACION' },
  ];

  for (const cat of categories) {
    await prisma.categoriaPaquete.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: {
        nombre: cat.nombre,
        estado: 'ACTIVO',
      },
    });
  }

  console.log('Categorías de paquetes creadas');

  console.log('Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
