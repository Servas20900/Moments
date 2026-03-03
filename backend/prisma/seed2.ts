import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed oficial de Moments (versión operativa real)...');

  const IMAGEN_PAQUETE_UNICA = 'https://res.cloudinary.com/dshoygnrv/image/upload/v1771981911/moments/yfw9s2ssiwrmsjlqzsfa.jpg';

  /* =====================================================
    1. CATEGORÍAS DE VEHÍCULOS
  ===================================================== */

  const suv = await prisma.categoriaVehiculo.upsert({
    where: { nombre: 'SUV' },
    update: {},
    create: { nombre: 'SUV', estado: 'ACTIVO' },
  });

  const pickup = await prisma.categoriaVehiculo.upsert({
    where: { nombre: 'PickUp' },
    update: {},
    create: { nombre: 'PickUp', estado: 'ACTIVO' },
  });

  const minibus = await prisma.categoriaVehiculo.upsert({
    where: { nombre: 'Minibus' },
    update: {},
    create: { nombre: 'Minibus', estado: 'ACTIVO' },
  });

  /* =====================================================
      2. VEHÍCULOS (basado en Paquetes2 actualizado)
  ===================================================== */

  const suburban = await prisma.vehiculo.upsert({
    where: { id: 'suburban-2025' },
    update: {},
    create: {
      id: 'suburban-2025',
      nombre: 'Chevrolet Suburban 2025',
      categoriaId: suv.id,
      asientos: 6,
      cantidad: 5, // actualizado
      caracteristicas: [
        'SUV ejecutiva full size',
        'Interior en cuero premium',
        'Sistema de sonido Bose',
        'Climatización dual independiente',
        'Vidrios polarizados',
        'Iluminación ambiental LED',
        'Amplio espacio para equipaje',
        'Año 2025',
      ],
      estado: 'ACTIVO',
    } as any,
  });

  const tahoe = await prisma.vehiculo.upsert({
    where: { id: 'tahoe-2025' },
    update: {},
    create: {
      id: 'tahoe-2025',
      nombre: 'Chevrolet Tahoe 2025',
      categoriaId: suv.id,
      asientos: 4,
      cantidad: 5, // actualizado
      caracteristicas: [
        'SUV ejecutiva',
        'Interior premium',
        'Pantalla multimedia táctil',
        'Climatización automática',
        'Vidrios polarizados',
        'Excelente confort urbano',
        'Año 2025',
      ],
      estado: 'ACTIVO',
    } as any,
  });

  const ram = await prisma.vehiculo.upsert({
    where: { id: 'ram-1500-2025' },
    update: {},
    create: {
      id: 'ram-1500-2025',
      nombre: 'Ram 1500 Limited 2025',
      categoriaId: pickup.id,
      asientos: 4,
      cantidad: 1,
      caracteristicas: [
        'PickUp edición Limited',
        'Interior cuero premium',
        'Sistema de sonido Harman Kardon',
        'Sunroof panorámico',
        'Estilo deportivo ejecutivo',
        'Año 2025',
      ],
      estado: 'ACTIVO',
    } as any,
  });

  const range = await prisma.vehiculo.upsert({
    where: { id: 'range-rover-2025' },
    update: {},
    create: {
      id: 'range-rover-2025',
      nombre: 'Range Rover 2025',
      categoriaId: suv.id,
      asientos: 4,
      cantidad: 1,
      caracteristicas: [
        'SUV de alta gama',
        'Interior de lujo',
        'Sistema Meridian Surround',
        'Suspensión neumática adaptativa',
        'Experiencia VIP',
        'Año 2025',
      ],
      estado: 'ACTIVO',
    } as any,
  });

  const mercedesBenz = await prisma.vehiculo.upsert({
    where: { id: 'mercedes-benz-2025' },
    update: {},
    create: {
      id: 'mercedes-benz-2025',
      nombre: 'Mercedes-Benz 2025',
      categoriaId: suv.id,
      asientos: 4,
      cantidad: 1,
      caracteristicas: [
        'Vehículo premium de lujo',
        'Interior ejecutivo de alta gama',
        'Confort superior para traslados exclusivos',
        'Presencia elegante para ocasiones especiales',
        'Año 2025',
      ],
      estado: 'ACTIVO',
    } as any,
  });

  const hiace = await prisma.vehiculo.upsert({
    where: { id: 'hiace-2025' },
    update: {},
    create: {
      id: 'hiace-2025',
      nombre: 'Toyota Hiace 2025',
      categoriaId: minibus.id,
      asientos: 14,
      cantidad: 1,
      caracteristicas: [
        'Minibus ejecutivo',
        'Amplia capacidad grupal',
        'Aire acondicionado independiente',
        'Asientos reclinables',
        'Ideal para eventos y turismo',
        'Año 2025',
      ],
      estado: 'ACTIVO',
    } as any,
  });

  const sprinter = await prisma.vehiculo.upsert({
    where: { id: 'sprinter-2025' },
    update: {},
    create: {
      id: 'sprinter-2025',
      nombre: 'Mercedes Sprinter 2025',
      categoriaId: minibus.id,
      asientos: 11,
      cantidad: 1,
      caracteristicas: [
        'Minibus versión VIP',
        'Interior cómodo y espacioso',
        'Aire acondicionado dual',
        'Configuración ejecutiva',
        'Ideal para transporte corporativo',
        'Año 2025',
      ],
      estado: 'ACTIVO',
    } as any,
  });

  async function sincronizarImagenesVehiculo(
    vehiculoId: string,
    imagenes: Array<{ url: string; altText: string; orden?: number }>
  ) {
    await prisma.imagenVehiculo.deleteMany({
      where: { vehiculoId },
    });

    for (let index = 0; index < imagenes.length; index++) {
      const item = imagenes[index];
      const orden = item.orden ?? index;

      const imagenExistente = await prisma.imagen.findFirst({
        where: {
          url: item.url,
          categoria: 'VEHICULO',
        },
      });

      const imagen = imagenExistente
        ? imagenExistente
        : await prisma.imagen.create({
            data: {
              url: item.url,
              altText: item.altText,
              categoria: 'VEHICULO',
              estado: 'ACTIVO',
            },
          });

      await prisma.imagenVehiculo.create({
        data: {
          vehiculoId,
          imagenId: imagen.id,
          orden,
        },
      });
    }
  }

  await sincronizarImagenesVehiculo(suburban.id, [
    {
      url: 'https://res.cloudinary.com/dshoygnrv/image/upload/v1772512924/5_srzqil.png',
      altText: 'Chevrolet Suburban 2025',
      orden: 0,
    },
  ]);

  await sincronizarImagenesVehiculo(tahoe.id, [
    {
      url: 'https://res.cloudinary.com/dshoygnrv/image/upload/v1772512924/3_czaznd.png',
      altText: 'Chevrolet Tahoe 2025',
      orden: 0,
    },
  ]);

  await sincronizarImagenesVehiculo(ram.id, [
    {
      url: 'https://res.cloudinary.com/dshoygnrv/image/upload/v1772512924/4_aqooi2.png',
      altText: 'Ram 1500 Limited 2025',
      orden: 0,
    },
  ]);

  await sincronizarImagenesVehiculo(range.id, [
    {
      url: 'https://res.cloudinary.com/dshoygnrv/image/upload/v1772512924/1_xx6wvb.png',
      altText: 'Range Rover 2025',
      orden: 0,
    },
  ]);

  await sincronizarImagenesVehiculo(mercedesBenz.id, [
    {
      url: 'https://res.cloudinary.com/dshoygnrv/image/upload/v1772513000/2_luhbk8.png',
      altText: 'Mercedes-Benz 2025',
      orden: 0,
    },
  ]);

  await sincronizarImagenesVehiculo(hiace.id, [
    {
      url: 'https://res.cloudinary.com/dshoygnrv/image/upload/v1772513698/7_m9zeic.png',
      altText: 'Toyota Hiace 2025',
      orden: 0,
    },
  ]);

  await sincronizarImagenesVehiculo(sprinter.id, [
    {
      url: 'https://res.cloudinary.com/dshoygnrv/image/upload/v1772513697/6_kkbbuy.png',
      altText: 'Mercedes Sprinter 2025',
      orden: 0,
    },
  ]);

  /* =====================================================
      3. CATEGORÍAS DE PAQUETES
  ===================================================== */

  const cumple = await prisma.categoriaPaquete.upsert({
    where: { nombre: 'Cumpleaños / 15Años' },
    update: {},
    create: { nombre: 'Cumpleaños / 15Años', estado: 'ACTIVO' },
  });

  const especial = await prisma.categoriaPaquete.upsert({
    where: { nombre: 'Ocasión Especial' },
    update: {},
    create: { nombre: 'Ocasión Especial', estado: 'ACTIVO' },
  });

  const evento = await prisma.categoriaPaquete.upsert({
    where: { nombre: 'Día de Evento' },
    update: {},
    create: { nombre: 'Día de Evento', estado: 'ACTIVO' },
  });

  const standard = await prisma.categoriaPaquete.upsert({
    where: { nombre: 'Standard' },
    update: {},
    create: { nombre: 'Standard', estado: 'ACTIVO' },
  });

  const minibuses = await prisma.categoriaPaquete.upsert({
    where: { nombre: 'Minibuses' },
    update: {},
    create: { nombre: 'Minibuses', estado: 'ACTIVO' },
  });

  /* =====================================================
      4. FUNCIÓN PARA CREAR PAQUETE Y ASIGNAR VEHÍCULOS
  ===================================================== */

  async function crearPaquete(
    nombre: string,
    categoriaId: number,
    precio: number,
    capacidad: number,
    descripcion: string,
    incluidos: string[],
    vehiculos: any[]
  ) {
    const paqueteExistente = await prisma.paquete.findFirst({
      where: { nombre },
    });

    const paquete = paqueteExistente
      ? await prisma.paquete.update({
          where: { id: paqueteExistente.id },
          data: {
            categoriaId,
            descripcion,
            precioBase: precio,
            maxPersonas: capacidad,
            incluidos,
            estado: 'ACTIVO',
          },
        })
      : await prisma.paquete.create({
          data: {
            nombre,
            categoriaId,
            descripcion,
            precioBase: precio,
            maxPersonas: capacidad,
            incluidos,
            estado: 'ACTIVO',
          },
        });

    await prisma.paqueteVehiculo.deleteMany({
      where: { paqueteId: paquete.id },
    });

    await prisma.paqueteVehiculo.createMany({
      data: vehiculos.map((v) => ({
        paqueteId: paquete.id,
        vehiculoId: v.id,
      })),
      skipDuplicates: true,
    });

    await prisma.imagenPaquete.deleteMany({
      where: { paqueteId: paquete.id },
    });

    const imagenPaqueteExistente = await prisma.imagen.findFirst({
      where: {
        url: IMAGEN_PAQUETE_UNICA,
        categoria: 'PAQUETE',
      },
    });

    const imagenPaquete = imagenPaqueteExistente
      ? imagenPaqueteExistente
      : await prisma.imagen.create({
          data: {
            url: IMAGEN_PAQUETE_UNICA,
            altText: 'Imagen oficial de paquete Moments',
            categoria: 'PAQUETE',
            estado: 'ACTIVO',
          },
        });

    await prisma.imagenPaquete.create({
      data: {
        paqueteId: paquete.id,
        imagenId: imagenPaquete.id,
        orden: 0,
      },
    });
  }

  /* =====================================================
      5. PAQUETES SUV (Suburban / Tahoe / Ram)
  ===================================================== */

  const suvGroup = [suburban, tahoe, ram];

  await crearPaquete(
    'Prime',
    standard.id,
    450,
    6,
    'Paquete ideal para salidas exclusivas en grupos pequeños. Disfruta de transporte premium en SUV de alta gama con bebidas y snacks incluidos, perfecto para celebraciones privadas, reuniones especiales o una noche diferente con estilo.',
    [
      'Bebidas',
      'Snacks',
    ],
    suvGroup
  );

  await crearPaquete(
    'Gold',
    standard.id,
    650,
    6,
    'Una experiencia elevada que combina comodidad, lujo y recuerdos inolvidables. Incluye servicio fotográfico profesional para capturar cada momento mientras disfrutas de un traslado elegante y completamente equipado.',
    [
      'Bebidas',
      'Snacks',
      'Fotógrafo profesional',
    ],
    suvGroup
  );

  await crearPaquete(
    'Ride',
    evento.id,
    450,
    6,
    'Perfecto para eventos especiales. Incluye traslado seguro y cómodo, bebidas y snacks para el trayecto, además de beneficios exclusivos para eventos aliados. Ideal para vivir la experiencia sin preocuparte por el transporte.',
    [
      'Transporte',
      'Snacks',
      'Bebidas',
      'Descuento exclusivo en Psycho e Insania',
    ],
    suvGroup
  );

  await crearPaquete(
    'Luxor',
    evento.id,
    650,
    6,
    'El paquete más completo para tu día especial. Disfruta de transporte premium, comodidad total y beneficios exclusivos que elevan tu experiencia. Diseñado para quienes buscan comodidad, seguridad y distinción.',
    [
      'Transporte',
      'Bebidas',
      'Snacks',
      'Parqueo',
      'Descuento en eventos Insania y Psycho',
    ],
    suvGroup
  );

  await crearPaquete(
    'Especial',
    especial.id,
    550,
    4,
    'Diseñado para propuestas, aniversarios o momentos únicos. Una experiencia romántica y elegante con detalles personalizados que crean recuerdos inolvidables en un entorno exclusivo y sofisticado.',
    [
      'Transporte',
      'Champagne o bebidas premium',
      'Copas grabadas',
      'Ramo de flores',
      'Carta personalizada',
      'Chocolates',
    ],
    suvGroup
  );

  await crearPaquete(
    'Memory',
    cumple.id,
    450,
    6,
    'Celebra tu cumpleaños de forma diferente. Un paquete pensado para sorprender, con detalles personalizados y ambiente exclusivo que convierten cualquier celebración en una experiencia premium.',
    [
      'Transporte',
      'Bebidas',
      'Copas',
      'Vasos grabados',
      'Ramo de flores',
      'Carta personalizada',
      'Chocolates',
    ],
    suvGroup
  );

  /* =====================================================
      6. PAQUETES PREMIUM (Range Rover)
  ===================================================== */

  await crearPaquete(
    'Infinity',
    standard.id,
    550,
    4,
    'Elegancia y presencia en cada trayecto. Ideal para reuniones, citas especiales o salidas exclusivas donde la imagen y la comodidad marcan la diferencia.',
    [
      'Transporte',
      'Bebidas',
      'Snacks',
    ],
    [range, mercedesBenz]
  );

  await crearPaquete(
    'Premium',
    standard.id,
    700,
    4,
    'Una experiencia de alto nivel con estilo ejecutivo y servicio personalizado. Perfecto para quienes desean exclusividad y recuerdos capturados con calidad profesional.',
    [
      'Transporte',
      'Bebidas',
      'Snacks',
      'Fotógrafo profesional',
    ],
    [range, mercedesBenz]
  );

  await crearPaquete(
    'Platinum',
    evento.id,
    550,
    4,
    'Transporte premium para eventos especiales con un toque distintivo. Seguridad, confort y presencia en cada detalle.',
    [
      'Transporte',
      'Bebidas',
      'Snacks',
    ],
    [range, mercedesBenz]
  );

  await crearPaquete(
    'Exclusive',
    evento.id,
    700,
    4,
    'La máxima expresión de lujo y exclusividad para tu evento. Diseñado para clientes que buscan diferenciación y una experiencia superior desde el primer momento.',
    [
      'Transporte',
      'Bebidas',
      'Snacks',
    ],
    [range, mercedesBenz]
  );

  /* =====================================================
      7. Minibuses
  ===================================================== */

  await crearPaquete(
    'Minibús GAM',
    minibuses.id,
    500,
    14,
    'Ideal para grupos grandes dentro del Gran Área Metropolitana. Comodidad, espacio y ambiente premium para traslados turísticos, celebraciones o eventos corporativos.',
    [
      'Bebidas',
      'Snacks',
    ],
    [hiace, sprinter]
  );

  await crearPaquete(
    'Minibús Out GAM',
    minibuses.id,
    500,
    14,
    'Pensado para viajes fuera del GAM. Espacio amplio y confort garantizado para disfrutar del trayecto con estilo y seguridad.',
    [
      'Bebidas',
      'Snacks',
    ],
    [hiace, sprinter]
  );

  console.log('Seed operativo finalizado correctamente.');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });