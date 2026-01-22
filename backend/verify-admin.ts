import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAdmin() {
  console.log('Verificando usuario admin y sus roles...\n');

  const admin = await prisma.usuario.findUnique({
    where: { email: 'admin@moments.com' },
    include: {
      roles: {
        include: {
          rol: true,
        },
      },
    },
  });

  if (!admin) {
    console.error('❌ ERROR: Usuario admin NO encontrado');
    return;
  }

  console.log('✅ Usuario encontrado:');
  console.log('   ID:', admin.id);
  console.log('   Email:', admin.email);
  console.log('   Nombre:', admin.nombre);
  console.log('   Estado:', admin.estado);
  console.log('');

  console.log('🔑 Roles asignados:');
  if (admin.roles.length === 0) {
    console.log('   ❌ SIN ROLES ASIGNADOS');
  } else {
    admin.roles.forEach((ur, index) => {
      console.log(`   ${index + 1}. Rol ID: ${ur.rolId}`);
      console.log(`      Código: ${ur.rol.codigo}`);
      console.log(`      Nombre: ${ur.rol.nombre}`);
      console.log(`      Estado: ${ur.rol.estado}`);
    });
  }

  console.log('');
  console.log('📊 Resumen:');
  console.log(`   Total de roles: ${admin.roles.length}`);
  console.log(`   Es Admin: ${admin.roles.some(ur => ur.rol.codigo === 'ADMIN') ? '✅ SÍ' : '❌ NO'}`);
  console.log('');

  // Verificar en la tabla usuarios_roles
  const directRoles = await prisma.usuarioRol.findMany({
    where: { usuarioId: admin.id },
    include: { rol: true },
  });

  console.log('🔍 Verificación directa en tabla usuarios_roles:');
  console.log(`   Registros encontrados: ${directRoles.length}`);
  directRoles.forEach((ur, index) => {
    console.log(`   ${index + 1}. usuarioId: ${ur.usuarioId}, rolId: ${ur.rolId}, código: ${ur.rol.codigo}`);
  });
}

verifyAdmin()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
