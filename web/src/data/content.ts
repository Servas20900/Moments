/**
 * SISTEMA DE PAQUETES - MOMENTS
 * 
 * Para agregar nuevas categorías o paquetes:
 * 
 * 1. CATEGORÍAS: Se generan automáticamente desde los paquetes.
 *    Simplemente usa un nuevo valor en el campo "category" de cualquier paquete.
 * 
 * 2. NUEVO PAQUETE: Copia la estructura abajo y ajusta los valores:
 *    - id: identificador único (ej: 'mi-paquete-2024')
 *    - category: nombre de la categoría (ej: 'Cualquier día', 'Día de evento', etc.)
 *    - name: nombre corto del paquete (ej: 'Ride', 'Experience')
 *    - description: descripción breve ~50-60 caracteres
 *    - price: precio numérico sin símbolo
 *    - vehicle: nombre del vehículo
 *    - maxPeople: capacidad máxima
 *    - includes: array de beneficios incluidos
 *    - imageUrl: URL de imagen (Unsplash)
 *    - addons: (opcional) texto de servicios adicionales
 * 
 * 3. ORDEN: Los paquetes se muestran por categoría en el orden que aparecen aquí.
 * 
 * 4. IMÁGENES: Usar URLs de Unsplash o Cloudinary
 */

export type Package = {
  id: string
  category: string
  name: string
  description: string
  price: number
  vehicle: string
  maxPeople: number
  includes: string[]
  imageUrl: string
  addons?: string
}

export type Vehicle = {
  id: string
  name: string
  category: string
  seats: number
  rate: string
  features: string[]
  imageUrl: string
}

export type CalendarSlot = {
  id: string
  date: string
  status: 'ocupado' | 'disponible' | 'evento'
  title: string
  detail?: string
  tag?: string
}

export const heroImage = 'P00_wptrgt'

/**
 * LISTA DE PAQUETES
 * 
 * Para agregar un nuevo paquete, copia este template y ajusta los valores:
 * 
 * {
 *   id: 'identificador-unico',
 *   category: 'Nombre de Categoría',  // Se agrupan automáticamente por este campo
 *   name: 'Nombre Paquete',
 *   description: 'Descripción breve del paquete (~50-60 caracteres)',
 *   price: 450,  // Sin símbolo $
 *   vehicle: 'Tipo de vehículo',
 *   maxPeople: 7,
 *   includes: [
 *     'Beneficio 1',
 *     'Beneficio 2',
 *     'Beneficio 3'
 *   ],
 *   imageUrl: 'https://images.unsplash.com/photo-xxxxx?w=800&q=80',
 *   addons: '(Opcional) Texto de servicios adicionales'
 * }
 * 
 * CATEGORÍAS ACTUALES:
 * - Cualquier día
 * - Día de evento
 * - Ocasión especial
 * - Celebración
 */
export const packages: Package[] = [
  // ==========================================
  // CATEGORÍA: Cualquier día - Tahoe/Suburban
  // ==========================================
  {
    id: 'tahoe-ride',
    category: 'Cualquier día',
    name: 'Ride',
    description: 'Transporte premium con chofer profesional para cualquier ocasión',
    price: 450,
    vehicle: 'Tahoe o Suburban',
    maxPeople: 7,
    includes: [
      'Transporte privado (con chofer personal)',
      'Bebidas Premium',
      'Snacks'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
    addons: 'Escolta disponible por $120 adicionales'
  },
  {
    id: 'tahoe-experience',
    category: 'Cualquier día',
    name: 'Experience',
    description: 'Experiencia completa con fotografía profesional',
    price: 650,
    vehicle: 'Tahoe o Suburban',
    maxPeople: 7,
    includes: [
      'Transporte privado (con chofer personal)',
      'Bebidas Premium',
      'Snacks',
      'Fotógrafo profesional',
      'Merch Exclusivo'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
    addons: 'Escolta disponible por $120 adicionales'
  },
  
  // ==========================================
  // CATEGORÍA: Cualquier día - Rover/Mercedes
  // ==========================================
  {
    id: 'luxury-ride',
    category: 'Cualquier día',
    name: 'Ride',
    description: 'Experiencia de lujo y distinción en cada traslado',
    price: 550,
    vehicle: 'Range Rover SVR o Mercedes Benz AMG',
    maxPeople: 4,
    includes: [
      'Transporte privado (con chofer personal)',
      'Bebidas Premium',
      'Snacks'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
    addons: 'Escolta disponible por $120 adicionales'
  },
  {
    id: 'luxury-experience',
    category: 'Cualquier día',
    name: 'Experience',
    description: 'Servicio premium con fotografía y beneficios exclusivos',
    price: 700,
    vehicle: 'Range Rover SVR o Mercedes Benz AMG',
    maxPeople: 4,
    includes: [
      'Transporte privado (con chofer personal)',
      'Bebidas Premium',
      'Snacks',
      'Fotógrafo profesional',
      'Merch Exclusivo'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
    addons: 'Escolta disponible por $120 adicionales'
  },

  // ==========================================
  // CATEGORÍA: Día de evento - Tahoe/Suburban
  // ==========================================
  {
    id: 'event-tahoe-ride',
    category: 'Día de evento',
    name: 'Ride',
    description: 'Traslado VIP con descuentos exclusivos en entradas',
    price: 450,
    vehicle: 'Tahoe o Suburban',
    maxPeople: 7,
    includes: [
      'Transporte privado (con chofer personal)',
      'Bebidas Premium',
      'Snacks',
      'Descuento exclusivo en entradas (Eventos de Insania & Psycho Paradise)'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
  },
  {
    id: 'event-tahoe-experience',
    category: 'Día de evento',
    name: 'Experience',
    description: 'Experiencia VIP completa en el evento',
    price: 650,
    vehicle: 'Tahoe o Suburban',
    maxPeople: 7,
    includes: [
      'Transporte privado (con chofer personal)',
      'Bebidas Premium',
      'Snacks',
      'Fotógrafo profesional (Incluye fotos en el evento siempre y cuando sea posible)',
      'Merch Exclusivo',
      'Parqueo reservado',
      'Descuento exclusivo en entradas (Eventos de Insania & Psycho Paradise)'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
  },

  // ==========================================
  // CATEGORÍA: Día de evento - Rover/Mercedes
  // ==========================================
  {
    id: 'event-luxury-ride',
    category: 'Día de evento',
    name: 'Ride',
    description: 'Llega con estilo premium en vehículo de lujo a tu evento',
    price: 550,
    vehicle: 'Range Rover SVR o Mercedes Benz AMG',
    maxPeople: 4,
    includes: [
      'Transporte privado (con chofer personal)',
      'Bebidas Premium',
      'Snacks'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
    addons: 'Escolta disponible por $120 adicionales'
  },
  {
    id: 'event-luxury-experience',
    category: 'Día de evento',
    name: 'Experience',
    description: 'Servicio VIP completo con fotografía y merch exclusivo',
    price: 700,
    vehicle: 'Range Rover SVR o Mercedes Benz AMG',
    maxPeople: 4,
    includes: [
      'Transporte privado (con chofer personal)',
      'Bebidas Premium',
      'Snacks',
      'Fotógrafo profesional',
      'Merch Exclusivo'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
    addons: 'Escolta disponible por $120 adicionales'
  },

  // ==========================================
  // CATEGORÍA: Ocasión especial
  // ==========================================
  {
    id: 'special-occasion',
    category: 'Ocasión especial',
    name: 'Special',
    description: 'Paquete romántico con champagne, flores y detalles personalizados',
    price: 500,
    vehicle: 'Tahoe o Suburban',
    maxPeople: 2,
    includes: [
      'Transporte privado (con chofer personal)',
      'Botella de Champagne o Bebidas premium',
      'Copas con gravado de nombre o iniciales',
      'Ramo de Flores (escoger preferencia de Flores)',
      'Chocolates',
      'Carta con mensaje especial',
      'Fotógrafo Profesional ($100 adicionales entrega de fotos el mismo día)'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
  },

  // ==========================================
  // CATEGORÍA: Celebración
  // ==========================================
  {
    id: 'birthday-celebration',
    category: 'Celebración',
    name: 'Memory',
    description: 'Celebración especial con flores, chocolates y fotografía',
    price: 450,
    vehicle: 'Tahoe o Suburban',
    maxPeople: 7,
    includes: [
      'Transporte privado (con chofer personal)',
      'Bebidas de su preferencia',
      'Copas o vasos con gravado de nombre o iniciales',
      'Ramo de Flores (escoger preferencia de Flores)',
      'Chocolates',
      'Carta con mensaje especial',
      'Fotógrafo ($100 adicionales entrega de fotos el mismo día)'
    ],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
  }
]

export const vehicles: Vehicle[] = [
  {
    id: 'maybach',
    name: 'Mercedes-Maybach S580',
    category: 'Sedan ejecutivo',
    seats: 4,
    rate: '$280/h',
    features: ['Asientos reclinables', 'Sistema Burmester', 'Iluminacion ambiental'],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
  },
  {
    id: 'range-rover',
    name: 'Range Rover Autobiography',
    category: 'SUV premium',
    seats: 5,
    rate: '$240/h',
    features: ['Traccion inteligente', 'Climatizacion quad-zone', 'Privacidad tonalizada'],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
  },
  {
    id: 'escalade',
    name: 'Cadillac Escalade ESV',
    category: 'SUV eventos',
    seats: 7,
    rate: '$220/h',
    features: ['Espacio ejecutivo', 'Pantallas traseras', 'Configuracion lounge'],
    imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
  },
]

export const calendar: CalendarSlot[] = [
  { id: 'jan05', date: '2026-01-05', status: 'evento', title: 'Concierto internacional', detail: 'Estadio Nacional', tag: 'Concierto' },
  { id: 'jan08', date: '2026-01-08', status: 'disponible', title: 'Ventana prioritaria', detail: 'Rutas privadas' },
  { id: 'jan12', date: '2026-01-12', status: 'ocupado', title: 'Boda privada', detail: 'Heredia' },
  { id: 'jan15', date: '2026-01-15', status: 'evento', title: 'Gala benefica', detail: 'Centro de Convenciones', tag: 'Gala' },
  { id: 'jan20', date: '2026-01-20', status: 'ocupado', title: 'Agenda bloqueada', detail: 'Lista de espera' },
  { id: 'jan23', date: '2026-01-23', status: 'disponible', title: 'Corporate shuttle', detail: 'Zona Escazu' },
  { id: 'jan27', date: '2026-01-27', status: 'evento', title: 'After party concierto', detail: 'VIP hospitality', tag: 'Concierto' },
]

export const eventHighlight = {
  title: 'Bodas y eventos especiales',
  subtitle: 'Coordinacion completa, timing impecable y atencion silenciosa para que todo fluya sin esfuerzo.',
  imageUrl: 'https://res.cloudinary.com/dcwxslhjf/image/upload/v1767670912/P00_wptrgt.png',
  points: [
    'Transiciones discretas entre ceremonia, recepcion y after',
    'Choferes entrenados en protocolo y trato premium',
    'Rutas testeadas con buffers de tiempo',
  ],
}

// ==========================================
// DISPONIBILIDAD DE VEHÍCULOS
// Para agregar ocupación a un vehículo:
// 1. Usa el vehicleId que aparece en la sección de vehicles
// 2. Usa el formato de fecha: YYYY-MM-DD
// 3. isOccupied: true = ocupado, false = disponible
//
// ADMIN NOTES:
// En futuras implementaciones, esto será manejable desde un panel admin
// donde podrás agregar, editar y eliminar fechas ocupadas.
// ==========================================
export type VehicleOccupancy = {
  vehicleId: string
  date: string
  isOccupied: boolean
}

export const vehicleOccupancy: VehicleOccupancy[] = [
  // Mercedes-Maybach S580
  { vehicleId: 'maybach', date: '2026-01-05', isOccupied: true },
  { vehicleId: 'maybach', date: '2026-01-08', isOccupied: true },
  { vehicleId: 'maybach', date: '2026-01-12', isOccupied: true },
  { vehicleId: 'maybach', date: '2026-01-15', isOccupied: true },
  { vehicleId: 'maybach', date: '2026-01-20', isOccupied: true },

  // Range Rover Autobiography
  { vehicleId: 'range-rover', date: '2026-01-06', isOccupied: true },
  { vehicleId: 'range-rover', date: '2026-01-09', isOccupied: true },
  { vehicleId: 'range-rover', date: '2026-01-14', isOccupied: true },

  // Cadillac Escalade ESV
  { vehicleId: 'escalade', date: '2026-01-05', isOccupied: true },
  { vehicleId: 'escalade', date: '2026-01-10', isOccupied: true },
  { vehicleId: 'escalade', date: '2026-01-18', isOccupied: true },
]
