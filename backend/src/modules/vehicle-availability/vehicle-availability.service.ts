import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MotivoDisponibilidad } from '@prisma/client';

@Injectable()
export class VehicleAvailabilityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if a vehicle is available on a specific date
   * Considers:
   * - Admin blocks (BLOQUEADO_ADMIN, MANTENIMIENTO, OTRO)
   * - Active reservations (vehiculoId)
   * - Vehicle units (quantity)
   */
  async checkAvailability(vehiculoId: string, fecha: string) {
    const targetDate = new Date(fecha);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Verificar bloqueos de admin para este vehículo en esta fecha
    const bloqueosExistentes = await this.prisma.disponibilidadVehiculo.findMany({
      where: {
        vehiculoId,
        fecha: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    });

    // Obtener unidad del vehículo (cuántas unidades existen)
    const vehiculoUnidad = await this.prisma.vehiculoUnidad.findUnique({
      where: { vehiculoId },
    });
    const cantidadDisponible = vehiculoUnidad?.cantidad ?? 1;

    // Contar reservas activas para ese vehículo en esa fecha
    const reservasActivas = await this.prisma.reserva.count({
      where: {
        vehiculoId,
        fechaEvento: {
          gte: targetDate,
          lt: nextDay,
        },
        estado: {
          in: ['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA', 'COMPLETADA'],
        },
      },
    });

    // Si hay bloqueos admin, no está disponible
    if (bloqueosExistentes.length > 0) {
      const bloqueo = bloqueosExistentes[0];
      return {
        available: false,
        bloqueadoPor: bloqueo.motivo,
        detalles: bloqueo.detalles || 'No disponible por bloqueo administrativo',
        cantidadDisponible: 0,
        cantidadTotal: cantidadDisponible,
      };
    }

    // Si las reservas activas >= cantidad disponible -> no disponible
    if (reservasActivas >= cantidadDisponible) {
      return {
        available: false,
        bloqueadoPor: 'RESERVADO' as MotivoDisponibilidad,
        detalles: `Todas las unidades están reservadas (${reservasActivas}/${cantidadDisponible})`,
        cantidadDisponible: 0,
        cantidadTotal: cantidadDisponible,
      };
    }

    // Disponible pero con unidades limitadas
    return {
      available: true,
      bloqueadoPor: null,
      detalles: null,
      cantidadDisponible: cantidadDisponible - reservasActivas,
      cantidadTotal: cantidadDisponible,
    };
  }

  /**
   * Get all blocks for a vehicle on a specific date
   */
  async getBlocks(vehiculoId: string, fecha: string) {
    const targetDate = new Date(fecha);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.disponibilidadVehiculo.findMany({
      where: {
        vehiculoId,
        fecha: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  /**
   * Get all blocks for a vehicle (for admin view)
   */
  async getAllBlocksByVehicle(vehiculoId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.disponibilidadVehiculo.findMany({
      where: {
        vehiculoId,
        fecha: { gte: today }, // Solo bloqueos futuros
      },
      orderBy: { fecha: 'asc' },
    });
  }

  /**
   * Create a block (Admin only)
   * Only allow blocking future dates
   */
  async createBlock(data: {
    vehiculoId: string;
    fecha: string;
    motivo: MotivoDisponibilidad;
    detalles?: string;
    creadoPor?: string;
  }) {
    const targetDate = new Date(data.fecha);
    targetDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate <= today) {
      throw new BadRequestException('Solo se pueden bloquear fechas futuras');
    }

    // Verificar que el vehículo existe
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: data.vehiculoId },
    });
    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    // Verificar si ya hay un bloqueo en esta fecha
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const bloqueosExistentes = await this.prisma.disponibilidadVehiculo.findFirst({
      where: {
        vehiculoId: data.vehiculoId,
        fecha: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    });

    if (bloqueosExistentes) {
      throw new BadRequestException('Ya existe un bloqueo para este vehículo en esta fecha');
    }

    return this.prisma.disponibilidadVehiculo.create({
      data: {
        vehiculoId: data.vehiculoId,
        fecha: targetDate,
        motivo: data.motivo,
        detalles: data.detalles,
        creadoPor: data.creadoPor,
      },
    });
  }

  /**
   * Delete a block (Admin only)
   */
  async deleteBlock(id: string) {
    const bloqueo = await this.prisma.disponibilidadVehiculo.findUnique({
      where: { id },
    });
    if (!bloqueo) {
      throw new NotFoundException('Bloqueo no encontrado');
    }

    await this.prisma.disponibilidadVehiculo.delete({ where: { id } });
    return { message: 'Bloqueo eliminado correctamente' };
  }

  /**
   * Get monthly availability calendar for a vehicle (Admin view)
   * Returns availability status for each day of the month
   */
  async getMonthlyAvailability(vehiculoId: string, year: number, month: number) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0, 23, 59, 59, 999);

    const [bloqueosAdmin, reservasActivas, vehiculoUnidad] = await Promise.all([
      this.prisma.disponibilidadVehiculo.findMany({
        where: {
          vehiculoId,
          fecha: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      }),
      this.prisma.reserva.findMany({
        where: {
          vehiculoId,
          fechaEvento: {
            gte: firstDay,
            lte: lastDay,
          },
          estado: {
            in: ['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA', 'COMPLETADA'],
          },
        },
      }),
      this.prisma.vehiculoUnidad.findUnique({
        where: { vehiculoId },
      }),
    ]);

    const cantidadTotal = vehiculoUnidad?.cantidad ?? 1;

    // Agrupar por día
    const calendar: Record<string, any> = {};
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const targetDate = new Date(year, month - 1, day);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Bloqueos de admin
      const bloqueoDia = bloqueosAdmin.find((b) => {
        const bloqDate = new Date(b.fecha);
        bloqDate.setHours(0, 0, 0, 0);
        return bloqDate.getTime() === targetDate.getTime();
      });

      // Contar reservas del día
      const reservasDia = reservasActivas.filter((r) => {
        const reservaDate = new Date(r.fechaEvento);
        reservaDate.setHours(0, 0, 0, 0);
        return reservaDate.getTime() === targetDate.getTime();
      }).length;

      const disponiblesDia = bloqueoDia ? 0 : Math.max(0, cantidadTotal - reservasDia);

      // Determinar color según reglas de negocio (igual que vista agregada)
      let color: 'red' | 'yellow' | 'blue' | 'green' = 'green';
      let statusText = 'Disponible';

      if (bloqueoDia || disponiblesDia === 0) {
        // 🔴 ROJO: Bloqueado O no hay unidades disponibles
        color = 'red';
        statusText = bloqueoDia ? 'Bloqueado' : 'Sin disponibilidad';
      } else if (disponiblesDia <= cantidadTotal * 0.2) {
        // 🟡 AMARILLO: Alta ocupación (80%+ ocupado)
        color = 'yellow';
        statusText = 'Alta ocupación';
      } else if (reservasDia > 0) {
        // 🔵 AZUL: Ocupación parcial
        color = 'blue';
        statusText = 'Ocupación parcial';
      }
      // else: 🟢 VERDE (default)

      calendar[dateKey] = {
        date: dateKey,
        color,
        statusText,
        isBlocked: !!bloqueoDia,
        motivo: bloqueoDia?.motivo,
        detalles: bloqueoDia?.detalles,
        reservasCount: reservasDia,
        disponibles: disponiblesDia,
        cantidadTotal,
      };
    }

    return {
      vehiculoId,
      year,
      month,
      cantidadTotal,
      days: Object.values(calendar),
    };
  }

  /**
   * Get unified calendar for ALL vehicles or a specific vehicle
   * This is the NEW unified endpoint for the admin view
   * 
   * REGLAS DE COLOR:
   * - 🔴 ROJO: Bloqueado admin O disponibles = 0 (NO HAY CARROS)
   * - 🟡 AMARILLO: Alta ocupación (límite alcanzado, sin bloqueo)
   * - 🔵 AZUL: Ocupación parcial (algunas reservas)
   * - 🟢 VERDE: Totalmente disponible (sin reservas ni bloqueos)
   */
  async getUnifiedCalendar(year: number, month: number, vehiculoId?: string) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0, 23, 59, 59, 999);

    // Si se proporciona vehiculoId, retornar solo ese vehículo
    if (vehiculoId) {
      return this.getMonthlyAvailability(vehiculoId, year, month);
    }

    // ======= VISTA AGREGADA: TODOS LOS VEHÍCULOS =======

    // Obtener todos los vehículos activos
    const vehiculos = await this.prisma.vehiculo.findMany({
      where: { estado: 'ACTIVO' },
      include: { unidad: true },
    });

    // Obtener TODOS los bloqueos del mes
    const bloqueosAdmin = await this.prisma.disponibilidadVehiculo.findMany({
      where: {
        fecha: { gte: firstDay, lte: lastDay },
      },
    });

    // Obtener TODAS las reservas activas del mes
    const reservasActivas = await this.prisma.reserva.findMany({
      where: {
        fechaEvento: { gte: firstDay, lte: lastDay },
        estado: { in: ['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA', 'COMPLETADA'] },
      },
      include: {
        vehiculo: { select: { nombre: true } },
        paquete: { select: { nombre: true } },
      },
    });

    // Construir calendario día por día
    const calendar: Record<string, any> = {};
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const targetDate = new Date(year, month - 1, day);
      targetDate.setHours(0, 0, 0, 0);

      // Calcular disponibilidad total del día (sumando todos los vehículos)
      let totalUnidades = 0;
      let totalReservas = 0;
      let totalBloqueados = 0;
      const vehiculosDelDia: any[] = [];

      for (const vehiculo of vehiculos) {
        const cantidad = vehiculo.unidad?.cantidad ?? 1;
        totalUnidades += cantidad;

        // Verificar si este vehículo tiene bloqueo admin en este día
        const bloqueoDia = bloqueosAdmin.find((b) => {
          const bloqDate = new Date(b.fecha);
          bloqDate.setHours(0, 0, 0, 0);
          return bloqDate.getTime() === targetDate.getTime() && b.vehiculoId === vehiculo.id;
        });

        // Contar reservas de este vehículo en este día
        const reservasVehiculo = reservasActivas.filter((r) => {
          const reservaDate = new Date(r.fechaEvento);
          reservaDate.setHours(0, 0, 0, 0);
          return reservaDate.getTime() === targetDate.getTime() && r.vehiculoId === vehiculo.id;
        });

        if (bloqueoDia) {
          totalBloqueados += cantidad;
        }
        
        totalReservas += reservasVehiculo.length;

        vehiculosDelDia.push({
          vehiculoId: vehiculo.id,
          nombre: vehiculo.nombre,
          cantidadTotal: cantidad,
          bloqueado: !!bloqueoDia,
          motivo: bloqueoDia?.motivo,
          detalles: bloqueoDia?.detalles,
          reservas: reservasVehiculo.length,
          disponibles: bloqueoDia ? 0 : Math.max(0, cantidad - reservasVehiculo.length),
        });
      }

      // Calcular disponibles totales del día
      const disponiblesDia = Math.max(0, totalUnidades - totalBloqueados - totalReservas);

      // Determinar color según reglas de negocio
      let color: 'red' | 'yellow' | 'blue' | 'green' = 'green';
      let statusText = 'Disponible';

      if (totalBloqueados > 0 || disponiblesDia === 0) {
        // 🔴 ROJO: Hay bloqueos O no hay carros disponibles
        color = 'red';
        statusText = totalBloqueados > 0 ? 'Bloqueado' : 'Sin disponibilidad';
      } else if (disponiblesDia <= totalUnidades * 0.2) {
        // 🟡 AMARILLO: Alta ocupación (80%+ ocupado)
        color = 'yellow';
        statusText = 'Alta ocupación';
      } else if (totalReservas > 0) {
        // 🔵 AZUL: Ocupación parcial
        color = 'blue';
        statusText = 'Ocupación parcial';
      }
      // else: 🟢 VERDE (default)

      calendar[dateKey] = {
        date: dateKey,
        color,
        statusText,
        totalUnidades,
        totalReservas,
        totalBloqueados,
        disponibles: disponiblesDia,
        vehiculos: vehiculosDelDia,
        // Listado de reservas del día para la tabla
        reservasDelDia: reservasActivas
          .filter((r) => {
            const reservaDate = new Date(r.fechaEvento);
            reservaDate.setHours(0, 0, 0, 0);
            return reservaDate.getTime() === targetDate.getTime();
          })
          .map((r) => ({
            id: r.id,
            vehiculo: (r.vehiculo as any)?.nombre || 'N/A',
            paquete: (r.paquete as any)?.nombre || 'N/A',
            cliente: r.nombre,
            estado: r.estado,
            horaInicio: r.horaInicio,
            horaFin: r.horaFin,
          })),
      };
    }

    return {
      vehiculoId: null, // Vista agregada
      year,
      month,
      totalVehiculos: vehiculos.length,
      totalUnidades: vehiculos.reduce((sum, v) => sum + (v.unidad?.cantidad ?? 1), 0),
      days: Object.values(calendar),
    };
  }
}

