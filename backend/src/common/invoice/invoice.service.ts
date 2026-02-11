import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Servicio para generar y gestionar números de factura únicos y profesionales
 * 
 * Formato: MOM-YYYYMMDD-00001
 * Ejemplo: MOM-20260210-00001 (Moments - 10 Feb 2026 - Factura #1 del día)
 */
@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly PREFIX = 'MOM';
  private readonly COMPANY_CODE = 'MOM';

  constructor(private prisma: PrismaService) {}

  /**
   * Genera un número de factura único y profesional
   * Formato: MOM-YYYYMMDD-NNNNN
   * - MOM: Código de empresa
   * - YYYYMMDD: Fecha actual (ej: 20260210)
   * - NNNNN: Número secuencial del día (5 dígitos)
   */
  async generateInvoiceNumber(): Promise<string> {
    try {
      // Obtener fecha actual en formato YYYYMMDD
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;

      // Contar facturas del día actual
      const startOfDay = new Date(year, now.getMonth(), now.getDate());
      const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1);

      const countToday = await this.prisma.reserva.count({
        where: {
          creadoEn: {
            gte: startOfDay,
            lt: endOfDay,
          },
          numeroFactura: {
            not: null,
          },
        },
      });

      // Número secuencial (comenzando en 1, no en 0)
      const sequenceNumber = String(countToday + 1).padStart(5, '0');

      // Construir número de factura
      const invoiceNumber = `${this.PREFIX}-${dateStr}-${sequenceNumber}`;

      this.logger.log(`Número de factura generado: ${invoiceNumber}`);
      return invoiceNumber;
    } catch (error) {
      this.logger.error('Error al generar número de factura:', error);
      throw error;
    }
  }

  /**
   * Valida que un número de factura tenga el formato correcto
   */
  isValidInvoiceFormat(invoiceNumber: string): boolean {
    // Formato esperado: MOM-YYYYMMDD-NNNNN
    const pattern = /^MOM-\d{8}-\d{5}$/;
    return pattern.test(invoiceNumber);
  }

  /**
   * Extrae la información del número de factura
   */
  parseInvoiceNumber(invoiceNumber: string): {
    company: string;
    date: Date;
    sequence: number;
    dateString: string;
  } | null {
    if (!this.isValidInvoiceFormat(invoiceNumber)) {
      return null;
    }

    const parts = invoiceNumber.split('-');
    const company = parts[0];
    const dateStr = parts[1];
    const sequence = parseInt(parts[2], 10);

    // Parsear fecha
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10);
    const day = parseInt(dateStr.substring(6, 8), 10);

    const date = new Date(year, month - 1, day);

    return {
      company,
      date,
      sequence,
      dateString: dateStr,
    };
  }

  /**
   * Obtiene todas las facturas de un día específico
   */
  async getInvoicesByDate(date: Date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    return this.prisma.reserva.findMany({
      where: {
        creadoEn: {
          gte: startOfDay,
          lt: endOfDay,
        },
        numeroFactura: {
          not: null,
        },
      },
      select: {
        id: true,
        numeroFactura: true,
        nombre: true,
        email: true,
        precioTotal: true,
        estado: true,
        creadoEn: true,
      },
      orderBy: {
        creadoEn: 'asc',
      },
    });
  }

  /**
   * Obtiene una factura por número
   */
  async getInvoiceByNumber(invoiceNumber: string) {
    return this.prisma.reserva.findUnique({
      where: {
        numeroFactura: invoiceNumber,
      },
    });
  }

  /**
   * Obtiene todas las facturas dentro de un rango de fechas
   */
  async getInvoicesByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.reserva.findMany({
      where: {
        creadoEn: {
          gte: startDate,
          lte: endDate,
        },
        numeroFactura: {
          not: null,
        },
      },
      select: {
        id: true,
        numeroFactura: true,
        nombre: true,
        email: true,
        precioTotal: true,
        estado: true,
        creadoEn: true,
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  /**
   * Obtiene estadísticas de facturas
   */
  async getInvoiceStats(startDate: Date, endDate: Date) {
    const reservas = await this.prisma.reserva.findMany({
      where: {
        creadoEn: {
          gte: startDate,
          lte: endDate,
        },
        numeroFactura: {
          not: null,
        },
      },
      select: {
        precioTotal: true,
        anticipo: true,
        estado: true,
      },
    });

    const totalReservas = reservas.length;
    const montoTotal = reservas.reduce((sum, r) => sum + Number(r.precioTotal), 0);
    const anticipoTotal = reservas.reduce((sum, r) => sum + Number(r.anticipo), 0);
    const pendienteTotal = montoTotal - anticipoTotal;

    return {
      totalReservas,
      montoTotal,
      anticipoTotal,
      pendienteTotal,
      promedioReserva: totalReservas > 0 ? montoTotal / totalReservas : 0,
    };
  }
}
