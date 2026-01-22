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
  const hashedPasswordAdmin = await bcrypt.hash('Admin123!', 10);
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

  // 3. Crear usuarios de prueba
  console.log('Creando usuarios de prueba...');
  const hashedPasswordUser = await bcrypt.hash('password123', 10);
  
  const testUser1 = await prisma.usuario.upsert({
    where: { email: 'juan@example.com' },
    update: {},
    create: {
      email: 'juan@example.com',
      contrasena: hashedPasswordUser,
      nombre: 'Juan Pérez',
      telefono: '87654321',
      identificacion: '1-1234-5678',
      estado: 'ACTIVO',
    },
  });

  await prisma.usuarioRol.upsert({
    where: {
      usuarioId_rolId: {
        usuarioId: testUser1.id,
        rolId: rolUser.id,
      },
    },
    update: {},
    create: {
      usuarioId: testUser1.id,
      rolId: rolUser.id,
    },
  });

  const testUser2 = await prisma.usuario.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      email: 'maria@example.com',
      contrasena: hashedPasswordUser,
      nombre: 'María González',
      telefono: '87651234',
      identificacion: '2-2345-6789',
      estado: 'ACTIVO',
    },
  });

  await prisma.usuarioRol.upsert({
    where: {
      usuarioId_rolId: {
        usuarioId: testUser2.id,
        rolId: rolUser.id,
      },
    },
    update: {},
    create: {
      usuarioId: testUser2.id,
      rolId: rolUser.id,
    },
  });

  console.log('Usuarios de prueba creados');

  // 4. Crear categorías de paquetes
  console.log('Creando categorías de paquetes...');
  const categorias = ['Romántico', 'Familiar', 'Aventura', 'Premium'];
  
  for (const nombreCategoria of categorias) {
    await prisma.categoriaPaquete.upsert({
      where: { nombre: nombreCategoria },
      update: {},
      create: {
        nombre: nombreCategoria,
        estado: 'ACTIVO',
      },
    });
  }

  console.log('Categorías de paquetes creadas');

  // 5. Crear conductores
  console.log('Creando conductores...');
  await prisma.conductor.upsert({
    where: { id: 'conductor-1' },
    update: {},
    create: {
      id: 'conductor-1',
      nombre: 'Carlos Rodríguez',
      telefono: '88887777',
      estado: 'ACTIVO',
    },
  });

  await prisma.conductor.upsert({
    where: { id: 'conductor-2' },
    update: {},
    create: {
      id: 'conductor-2',
      nombre: 'Laura Morales',
      telefono: '88886666',
      estado: 'ACTIVO',
    },
  });

  console.log('Conductores creados');

  console.log('');
  console.log('Seed completado exitosamente!');
  console.log('');
  console.log('Credenciales de prueba:');
  console.log('  Admin: admin@moments.com / Admin123!');
  console.log('  Usuario 1: juan@example.com / password123');
  console.log('  Usuario 2: maria@example.com / password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
