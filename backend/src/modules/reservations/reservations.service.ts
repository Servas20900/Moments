import { Injectable, NotFoundException, Logger, BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EmailService } from "../../common/email/email.service";
import { InvoiceService } from "../../common/invoice/invoice.service";
import { CreateReservationDto } from "./dtos/create-reservation.dto";
import { EstadoContacto } from "./dtos/update-estado-operativo.dto";

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private invoiceService: InvoiceService,
  ) {}

  async create(dto: CreateReservationDto) {
    const userId =
      dto.usuarioId ??
      (await this.ensureUser(dto.email, dto.nombre, dto.telefono));
    const paqueteId = dto.paqueteId;
    const vehiculoId = dto.vehiculoId;

    if (!paqueteId) throw new NotFoundException("paqueteId es requerido");
    // vehiculoId es OPCIONAL - puede asignarse después

    const fechaEvento = new Date(dto.fechaEvento);
    const horaInicio = new Date(dto.horaInicio);
    const horaFin = new Date(dto.horaFin);

    if (!(horaInicio instanceof Date) || isNaN(horaInicio.getTime())) {
      throw new BadRequestException("horaInicio inválida");
    }
    if (!(horaFin instanceof Date) || isNaN(horaFin.getTime())) {
      throw new BadRequestException("horaFin inválida");
    }
    if (horaFin <= horaInicio) {
      throw new BadRequestException("horaFin debe ser mayor que horaInicio");
    }

    const paquete = await this.prisma.paquete.findUnique({
      where: { id: paqueteId },
      include: { vehiculos: true },
    });

    if (!paquete) {
      throw new NotFoundException("Paquete no encontrado");
    }

    // Validar vehículo SOLO SI fue proporcionado
    if (vehiculoId) {
      const allowedVehicleIds = paquete.vehiculos?.map((v) => v.vehiculoId) ?? [];
      if (allowedVehicleIds.length > 0 && !allowedVehicleIds.includes(vehiculoId)) {
        throw new BadRequestException("El vehículo no pertenece al paquete seleccionado");
      }

      // Verificar conflicto de horario SOLO SI hay vehículo
      const conflicting = await this.prisma.reserva.findFirst({
        where: {
          vehiculoId,
          estado: { in: ["PAGO_PENDIENTE", "PAGO_PARCIAL", "CONFIRMADA", "COMPLETADA"] },
          horaInicio: { lt: horaFin },
          horaFin: { gt: horaInicio },
        },
        select: { id: true },
      });

      if (conflicting) {
        throw new BadRequestException("El vehículo ya está reservado en ese horario");
      }
    }

    // ==========================================
    // CÁLCULO DE PRECIOS (NO CONFIAR EN FRONTEND)
    // ==========================================
    
    // 1. Precio base del paquete
    const precioBase = Number(paquete.precioBase);
    
    // 2. Calcular precio de extras
    let precioExtras = 0;
    const extrasValidados: Array<{extraId: string; cantidad: number; precioUnitario: number}> = [];
    
    if (Array.isArray(dto.extras) && dto.extras.length > 0) {
      const extraIds = dto.extras.map(e => e.extraId).filter(Boolean);
      
      if (extraIds.length > 0) {
        const extrasDB = await this.prisma.extra.findMany({
          where: { 
            id: { in: extraIds },
            estado: 'ACTIVO'
          },
          select: { id: true, precio: true }
        });
        
        const extrasMap = new Map(extrasDB.map(e => [e.id, Number(e.precio)]));
        
        for (const extraDTO of dto.extras) {
          const precioReal = extrasMap.get(extraDTO.extraId);
          if (precioReal !== undefined) {
            const cantidad = Math.max(1, Number(extraDTO.cantidad ?? 1));
            precioExtras += precioReal * cantidad;
            extrasValidados.push({
              extraId: extraDTO.extraId,
              cantidad,
              precioUnitario: precioReal
            });
          }
        }
      }
    }
    
    // 3. Precio total = base + extras
    const precioTotal = precioBase + precioExtras;
    
    // 4. Validar adelanto (mínimo 50%)
    const adelantoMinimo = precioTotal * 0.5;
    const anticipo = Number(dto.anticipo);
    
    if (anticipo < adelantoMinimo) {
      throw new BadRequestException(
        `El adelanto debe ser al menos el 50% del total. ` +
        `Mínimo requerido: $${adelantoMinimo.toFixed(2)}, ` +
        `recibido: $${anticipo.toFixed(2)}`
      );
    }
    
    if (anticipo > precioTotal) {
      throw new BadRequestException(
        `El adelanto no puede ser mayor al precio total. ` +
        `Total: $${precioTotal.toFixed(2)}, adelanto: $${anticipo.toFixed(2)}`
      );
    }
    
    // 5. Calcular saldo restante
    const restante = precioTotal - anticipo;
    
    this.logger.log(
      `Reserva: precioBase=$${precioBase}, extras=$${precioExtras}, ` +
      `total=$${precioTotal}, anticipo=$${anticipo}, restante=$${restante}`
    );
    
    // ==========================================
    // GENERAR NÚMERO DE FACTURA
    // ==========================================
    const numeroFactura = await this.invoiceService.generateInvoiceNumber();
    
    // ==========================================
    // CREAR RESERVA CON PRECIOS CALCULADOS
    // ==========================================
    
    const created = await this.prisma.reserva.create({
      data: {
        usuarioId: userId,
        paqueteId,
        vehiculoId: vehiculoId || null,  // ← Asegurar que sea null si no está definido
        conductorId: dto.conductorId,
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        direccion: dto.direccion ?? null,
        tipoIdentificacion: dto.tipoIdentificacion ?? null,
        identificacion: dto.numeroIdentificacion ?? null,
        tipoEvento: dto.tipoEvento,
        fechaEvento,
        horaInicio,
        horaFin,
        origen: dto.origen,
        destino: dto.destino,
        numeroPersonas: dto.numeroPersonas,
        precioBase,
        precioTotal,
        anticipo,
        restante,
        estado: "PAGO_PENDIENTE",
        tipoPago: dto.tipoPago as any,
        numeroFactura,
        notasInternas: dto.notasInternas || null,
      },
    });

    // Registrar extras validados
    if (extrasValidados.length > 0) {
      await this.prisma.reservaExtra.createMany({ 
        data: extrasValidados.map((x) => ({
          reservaId: created.id,
          extraId: x.extraId,
          cantidad: x.cantidad,
          precioUnitario: x.precioUnitario,
        }))
      });
      this.logger.log(`${extrasValidados.length} extras registrados para reserva #${created.id}`);
    }

    // ==========================================
    // GUARDAR INCLUIDOS SELECCIONADOS
    // ==========================================
    if (Array.isArray(dto.incluidos) && dto.incluidos.length > 0) {
      const incluidoIds = dto.incluidos.map(i => i.incluidoId).filter(Boolean);
      
      if (incluidoIds.length > 0) {
        // Validar que los incluidos existan y estén activos
        const incluidosDB = await this.prisma.incluido.findMany({
          where: { 
            id: { in: incluidoIds },
            estado: 'ACTIVO'
          },
          select: { id: true }
        });
        
        const incluidosValidos = incluidosDB.map(i => i.id);
        const incluidosAGuardar = incluidoIds.filter(id => incluidosValidos.includes(id));
        
        if (incluidosAGuardar.length > 0) {
          await this.prisma.reservaIncluido.createMany({ 
            data: incluidosAGuardar.map((incluidoId) => ({
              reservaId: created.id,
              incluidoId: incluidoId,
            })),
            skipDuplicates: true,
          });
          this.logger.log(`${incluidosAGuardar.length} incluidos registrados para reserva #${created.id}`);
        }
      }
    }

    // ==========================================
    // ENVIAR CORREOS DE CONFIRMACIÓN (siempre)
    // ==========================================
    try {
      const paquete = await this.prisma.paquete.findUnique({ where: { id: paqueteId } });
      const vehiculo = vehiculoId ? await this.prisma.vehiculo.findUnique({ where: { id: vehiculoId } }) : null;
      
      // Obtener información detallada de extras (mostrar lo seleccionado por el cliente)
      let extrasInfo: Array<{ nombre: string; cantidad: number; precio: number }> = [];
      const extrasSeleccionados = Array.isArray(dto.extras) ? dto.extras : [];
      if (extrasSeleccionados.length > 0) {
        const extraIds = extrasSeleccionados.map(e => e.extraId).filter(Boolean);
        if (extraIds.length > 0) {
          const extrasDB = await this.prisma.extra.findMany({
            where: { id: { in: extraIds } },
            select: { id: true, nombre: true, precio: true }
          });
          extrasInfo = extrasSeleccionados.map((sel) => {
            const extra = extrasDB.find(e => e.id === sel.extraId);
            const cantidad = Math.max(1, Number(sel.cantidad ?? 1));
            const precioUnitario = extra ? Number(extra.precio) : Number(sel.precioUnitario ?? 0);
            return {
              nombre: extra?.nombre || `Extra (${sel.extraId})`,
              cantidad,
              precio: precioUnitario * cantidad
            };
          });
        }
      }

      // Obtener información detallada de incluidos CON CATEGORÍAS (mostrar lo seleccionado por el cliente)
      let incluidosInfo: Array<{ 
        id: string; 
        nombre: string; 
        descripcion?: string;
        categoria: { id: number; nombre: string };
      }> = [];
      const incluidosSeleccionados = Array.isArray(dto.incluidos) ? dto.incluidos : [];
      if (incluidosSeleccionados.length > 0) {
        const incluidoIds = incluidosSeleccionados.map(i => i.incluidoId).filter(Boolean);
        if (incluidoIds.length > 0) {
          const incluidosDB = await this.prisma.incluido.findMany({
            where: { id: { in: incluidoIds } },
            select: { 
              id: true, 
              nombre: true, 
              descripcion: true,
              categoria: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          });
          const incluidosMap = new Map(incluidosDB.map((incluido) => [incluido.id, incluido]));
          incluidosInfo = incluidoIds.map((incluidoId) => {
            const incluido = incluidosMap.get(incluidoId);
            return {
              id: incluidoId,
              nombre: incluido?.nombre || `Incluido (${incluidoId})`,
              descripcion: incluido?.descripcion || undefined,
              categoria: incluido?.categoria || { id: 0, nombre: 'Sin categoria' }
            };
          });
        }
      }

      const emailData = {
        nombre: created.nombre,
        email: created.email,
        reservaId: created.id,
        numeroFactura: created.numeroFactura,
        anticipo: Number(created.anticipo),
        total: Number(created.precioTotal),
        restante: Number(created.precioTotal) - Number(created.anticipo),
        fecha: created.fechaEvento,
        horaInicio: created.horaInicio,
        horaFin: created.horaFin,
        origen: created.origen,
        destino: created.destino,
        numeroPersonas: created.numeroPersonas,
        paquete: paquete?.nombre || 'Paquete',
        vehiculo: vehiculo ? `${vehiculo.nombre} (${vehiculo.asientos} asientos)` : undefined,
        telefono: created.telefono,
        direccion: created.direccion || undefined,
        tipoIdentificacion: created.tipoIdentificacion || undefined,
        tipoEvento: created.tipoEvento,
        precioBase: Number(paquete?.precioBase) || Number(created.precioTotal),
        precioExtras: precioExtras,
        identificacion: created.identificacion || undefined,
        notasInternas: created.notasInternas || undefined,
        origenReserva: created.origenReserva || 'WEB',
        tipoPago: created.tipoPago || 'SINPE',
        estadoPago: created.estado || 'PAGO_PENDIENTE',
        extras: extrasInfo.length > 0 ? extrasInfo : undefined,
        incluidos: incluidosInfo.length > 0 ? incluidosInfo : undefined,
      };

      // Enviar correo al cliente
      await this.emailService.sendReservationConfirmation(emailData);
      this.logger.log(`Correo de confirmación enviado para reserva #${created.id}`);

      // Enviar correo al administrador
      await this.emailService.sendAdminReservationNotification(emailData);
      this.logger.log(`Notificación admin enviada para reserva #${created.id}`);

    } catch (error) {
      this.logger.error(`Error al enviar correos para reserva #${created.id}:`, error);
      // No falla la reserva si el correo falla
    }

    return this.toResponse(created);
  }

  async findAll(filters?: {
    vehiculoId?: string;
    estado?: string;
    desde?: string;
    hasta?: string;
  }) {
    // Construir WHERE dinámico
    const where: any = {};

    if (filters?.vehiculoId) {
      where.vehiculoId = filters.vehiculoId;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.desde || filters?.hasta) {
      where.fechaEvento = {};
      if (filters.desde) {
        const desdeDate = new Date(filters.desde);
        desdeDate.setHours(0, 0, 0, 0);
        where.fechaEvento.gte = desdeDate;
      }
      if (filters.hasta) {
        const hastaDate = new Date(filters.hasta);
        hastaDate.setHours(23, 59, 59, 999);
        where.fechaEvento.lte = hastaDate;
      }
    }

    const items = await this.prisma.reserva.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      include: {
        vehiculo: { select: { nombre: true } },
        paquete: { select: { nombre: true } },
        extras: { 
          include: { 
            extra: { select: { nombre: true, precio: true, categoria: true } } 
          } 
        },
        incluidos: { 
          include: { 
            incluido: { 
              select: { nombre: true, descripcion: true, categoria: { select: { nombre: true } } } 
            } 
          } 
        },
      },
    });
    
    // Detectar conflictos para cada reserva
    const itemsWithConflicts = await Promise.all(
      items.map(async (r) => {
        const hasConflict = await this.hasConflict(r.id, r.vehiculoId, r.horaInicio, r.horaFin, r.estado);
        return { 
          ...this.toResponse(r),
          hasConflict,
          vehiculoNombre: (r.vehiculo as any)?.nombre,
          paqueteNombre: (r.paquete as any)?.nombre,
        };
      })
    );
    
    return itemsWithConflicts;
  }

  private async hasConflict(
    reservaId: string,
    vehiculoId: string | null,
    horaInicio: Date,
    horaFin: Date,
    estado: string
  ): Promise<boolean> {
    // Solo verificar conflictos si la reserva está activa
    if (estado === "CANCELADA") return false;
    
    // Si no hay vehículo asignado, no hay conflicto posible
    if (!vehiculoId) return false;
    
    const conflicting = await this.prisma.reserva.findFirst({
      where: {
        id: { not: reservaId },
        vehiculoId,
        estado: { in: ["PAGO_PENDIENTE", "PAGO_PARCIAL", "CONFIRMADA", "COMPLETADA"] },
        horaInicio: { lt: horaFin },
        horaFin: { gt: horaInicio },
      },
      select: { id: true },
    });
    
    return !!conflicting;
  }

  async confirmAdelanto(id: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva #${id} no encontrada`);
    }

    if (reserva.estado !== "PAGO_PENDIENTE") {
      throw new BadRequestException(
        `No se puede confirmar adelanto. Estado actual: ${reserva.estado}`
      );
    }

    const adelantoMinimo = Number(reserva.precioTotal) * 0.5;
    if (Number(reserva.anticipo) < adelantoMinimo) {
      throw new BadRequestException(
        `El adelanto registrado ($${Number(reserva.anticipo).toFixed(2)}) es menor al 50% requerido ($${adelantoMinimo.toFixed(2)})`
      );
    }

    const restante = Number(reserva.precioTotal) - Number(reserva.anticipo);
    const nuevoEstado = restante > 0.01 ? "PAGO_PARCIAL" : "CONFIRMADA";

    const updated = await this.prisma.reserva.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        restante,
      },
    });

    this.logger.log(
      `Reserva #${id}: Adelanto confirmado. Estado: ${reserva.estado} → ${nuevoEstado}. Restante: $${restante.toFixed(2)}`
    );

    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; }
            .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #c9a24d; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .box { background: #f5f5f5; padding: 20px; border-left: 4px solid #4caf50; margin: 20px 0; border-radius: 4px; }
            .box.highlight { background: #e8f5e9; border-left-color: #4caf50; }
            .amount { font-size: 28px; font-weight: bold; color: #1a1a2e; }
            .label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
            .footer { background: #1a1a2e; color: #c9a24d; padding: 20px; text-align: center; font-size: 12px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Adelanto Confirmado</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Reserva #${reserva.id}</p>
            </div>
            <div class="content">
              <p>Hola <strong>${reserva.nombre}</strong>,</p>
              <p>Hemos confirmado exitosamente la recepción de tu adelanto.</p>
              
              <div class="box highlight">
                <div class="label">Adelanto recibido</div>
                <div class="amount">$${Number(reserva.anticipo).toFixed(2)}</div>
              </div>

              ${restante > 0.01 ? `
                <div class="box">
                  <p style="margin: 0 0 10px 0;"><strong>Saldo pendiente:</strong></p>
                  <div class="amount" style="font-size: 20px; color: #c9a24d;">$${restante.toFixed(2)}</div>
                  <p style="margin: 15px 0 0 0; font-size: 14px;">Recuerda completar el pago antes de tu evento.</p>
                </div>
              ` : `
                <div class="box highlight">
                  <p style="margin: 0;"><strong>¡Pago completo confirmado!</strong> Tu reserva está lista.</p>
                </div>
              `}

              <div class="box">
                <p style="margin: 0 0 10px 0;"><strong>Próximos pasos:</strong></p>
                <p style="margin: 0;">Nuestro equipo se pondrá en contacto contigo en un plazo de <strong>48 horas hábiles</strong> para coordinar los detalles finales de tu reserva.</p>
              </div>

              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">Número de reserva: <strong>#${reserva.id}</strong></p>
            </div>
            <div class="footer">
              <p>Moments Transportation CR</p>
              <p>¡Gracias por confiar en nosotros!</p>
            </div>
          </div>
        </body>
        </html>
      `;
      await this.emailService.sendEmail({
        to: reserva.email,
        subject: `Adelanto confirmado - Reserva #${reserva.id} | Moments`,
        html: emailHtml,
      });
    } catch (error) {
      this.logger.error(`Error enviando email de adelanto confirmado:`, error);
    }

    return this.toResponse(updated);
  }

  async confirmPagoCompleto(id: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva #${id} no encontrada`);
    }

    if (reserva.estado !== "PAGO_PARCIAL" && reserva.estado !== "PAGO_PENDIENTE") {
      throw new BadRequestException(
        `No se puede confirmar pago completo desde estado: ${reserva.estado}`
      );
    }

    const precioTotal = Number(reserva.precioTotal);
    const anticipo = Number(reserva.anticipo);
    const restante = precioTotal - anticipo;

    if (restante > 0.01) {
      throw new BadRequestException(
        `Aún falta saldo por pagar: $${restante.toFixed(2)}. ` +
        `Total: $${precioTotal.toFixed(2)}, Pagado: $${anticipo.toFixed(2)}`
      );
    }

    const updated = await this.prisma.reserva.update({
      where: { id },
      data: {
        estado: "CONFIRMADA",
        restante: 0,
      },
    });

    this.logger.log(
      `Reserva #${id}: Pago completo confirmado. Estado: ${reserva.estado} → CONFIRMADA`
    );

    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; }
            .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #c9a24d; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .box { background: #f5f5f5; padding: 20px; border-left: 4px solid #4caf50; margin: 20px 0; border-radius: 4px; }
            .box.highlight { background: #e8f5e9; border-left-color: #4caf50; }
            .amount { font-size: 28px; font-weight: bold; color: #1a1a2e; }
            .label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
            .footer { background: #1a1a2e; color: #c9a24d; padding: 20px; text-align: center; font-size: 12px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Pago Completo Confirmado</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Reserva #${reserva.id}</p>
            </div>
            <div class="content">
              <p>Hola <strong>${reserva.nombre}</strong>,</p>
              <p>¡Excelente! Hemos confirmado el pago completo de tu reserva. Todo está listo.</p>
              
              <div class="box highlight">
                <div class="label">Monto pagado</div>
                <div class="amount">$${precioTotal.toFixed(2)}</div>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #2e7d32;">✓ Pago confirmado</p>
              </div>

              <div class="box">
                <p style="margin: 0 0 10px 0;"><strong>Próximos pasos:</strong></p>
                <p style="margin: 0;">Nuestro equipo se pondrá en contacto contigo en un plazo de <strong>48 horas hábiles</strong> para confirmar los detalles finales, horarios exactos y punto de encuentro.</p>
              </div>

              <div class="box">
                <p style="margin: 0 0 10px 0;"><strong>¿Preguntas?</strong></p>
                <p style="margin: 0;">Si tienes dudas o cambios urgentes, no dudes en responder a este correo. Estamos aquí para ayudarte.</p>
              </div>

              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">Número de reserva: <strong>#${reserva.id}</strong></p>
            </div>
            <div class="footer">
              <p>Moments Transportation CR</p>
              <p>¡Gracias por confiar en nosotros!</p>
            </div>
          </div>
        </body>
        </html>
      `;
      await this.emailService.sendEmail({
        to: reserva.email,
        subject: `Pago completo confirmado - Reserva #${reserva.id} | Moments`,
        html: emailHtml,
      });
    } catch (error) {
      this.logger.error(`Error enviando email de pago completo:`, error);
    }

    return this.toResponse(updated);
  }

  private toResponse(r: any) {
    return {
      id: r.id,
      numeroFactura: r.numeroFactura,
      nombre: r.nombre,
      email: r.email,
      telefono: r.telefono,
      estado: r.estado,
      fechaEvento: r.fechaEvento,
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
      numeroPersonas: r.numeroPersonas,
      precioBase: Number(r.precioBase),
      precioTotal: Number(r.precioTotal),
      anticipo: Number(r.anticipo),
      restante: Number(r.restante),
      paqueteId: r.paqueteId,
      vehiculoId: r.vehiculoId,
      tipoPago: r.tipoPago,
      origenReserva: r.origenReserva || 'WEB',
    };
  }

  private async ensureUser(email: string, nombre: string, telefono?: string) {
    const existing = await this.prisma.usuario.findUnique({ where: { email } });
    if (existing) return existing.id;
    const hashed = await bcrypt.hash("Temp1234!", 10);
    const user = await this.prisma.usuario.create({
      data: {
        email,
        contrasena: hashed,
        nombre: nombre || email,
        telefono: telefono || "",
        estado: "ACTIVO",
      },
    });

    // Asignar rol de usuario
    const rolUsuario = await this.prisma.rol.findFirst({
      where: { codigo: "USER" },
    });
    if (rolUsuario) {
      await this.prisma.usuarioRol.create({
        data: {
          usuarioId: user.id,
          rolId: rolUsuario.id,
        },
      });
    }

    return user.id;
  }

  private async firstActivePackage() {
    const pkg = await this.prisma.paquete.findFirst({
      where: { estado: "ACTIVO" },
      orderBy: { creadoEn: "desc" },
    });
    return pkg?.id;
  }

  private async firstActiveVehicle() {
    const vehicle = await this.prisma.vehiculo.findFirst({
      where: { estado: "ACTIVO" },
      orderBy: { creadoEn: "desc" },
    });
    return vehicle?.id;
  }

  /**
   * ========================================
   * ADMIN: CREAR RESERVA MANUAL
   * ========================================
   * Permite crear reservas desde el panel admin para casos externos:
   * - Reservas por WhatsApp, correo, teléfono
   * - Clientes corporativos
   * - Eventos internos
   */
  async createManual(dto: any, adminUser?: string) {
    const {
      nombre,
      email,
      telefono,
      identificacion,
      notasInternas,
      paqueteId,
      vehiculoId,
      conductorId,
      tipoEvento,
      fechaEvento,
      horaInicio,
      horaFin,
      origen,
      destino,
      numeroPersonas,
      tipoPago,
      origenReserva,
      anticipo,
      estadoInicial,
      extras,
      comentario,
    } = dto;

    // Validar fechas
    const fechaEventoDate = new Date(fechaEvento);
    const horaInicioDate = new Date(horaInicio);
    const horaFinDate = new Date(horaFin);

    if (!(horaInicioDate instanceof Date) || isNaN(horaInicioDate.getTime())) {
      throw new BadRequestException("horaInicio inválida");
    }
    if (!(horaFinDate instanceof Date) || isNaN(horaFinDate.getTime())) {
      throw new BadRequestException("horaFin inválida");
    }
    if (horaFinDate <= horaInicioDate) {
      throw new BadRequestException("horaFin debe ser mayor que horaInicio");
    }

    // Validar paquete
    const paquete = await this.prisma.paquete.findUnique({
      where: { id: paqueteId },
      include: { vehiculos: true },
    });

    if (!paquete) {
      throw new NotFoundException("Paquete no encontrado");
    }

    // Validar vehículo pertenece al paquete
    const allowedVehicleIds = paquete.vehiculos?.map((v) => v.vehiculoId) ?? [];
    if (allowedVehicleIds.length > 0 && !allowedVehicleIds.includes(vehiculoId)) {
      throw new BadRequestException("El vehículo no pertenece al paquete seleccionado");
    }

    // Verificar conflictos (NO BLOQUEANTE, solo FYI para el admin)
    const conflicting = await this.prisma.reserva.findFirst({
      where: {
        vehiculoId,
        estado: { in: ["PAGO_PENDIENTE", "PAGO_PARCIAL", "CONFIRMADA", "COMPLETADA"] },
        horaInicio: { lt: horaFinDate },
        horaFin: { gt: horaInicioDate },
      },
      select: { id: true, nombre: true },
    });

    // Solo registrar el warning, no bloquear la creación
    if (conflicting) {
      this.logger.warn(
        `⚠️ CONFLICTO DETECTADO: Vehículo ${vehiculoId} ya está reservado en ese horario (reserva #${conflicting.id} - ${conflicting.nombre})`
      );
    }

    // ==========================================
    // CÁLCULO DE PRECIOS (BACKEND ES LA FUENTE DE VERDAD)
    // ==========================================
    
    const precioBase = Number(paquete.precioBase);
    
    // Calcular precio de extras
    let precioExtras = 0;
    const extrasValidados: Array<{extraId: string; cantidad: number; precioUnitario: number}> = [];
    
    if (Array.isArray(extras) && extras.length > 0) {
      const extraIds = extras.map(e => e.extraId).filter(Boolean);
      
      if (extraIds.length > 0) {
        const extrasDB = await this.prisma.extra.findMany({
          where: { 
            id: { in: extraIds },
            estado: 'ACTIVO'
          },
          select: { id: true, precio: true }
        });
        
        const extrasMap = new Map(extrasDB.map(e => [e.id, Number(e.precio)]));
        
        for (const extraDTO of extras) {
          const precioReal = extrasMap.get(extraDTO.extraId);
          if (precioReal !== undefined) {
            const cantidad = Math.max(1, Number(extraDTO.cantidad ?? 1));
            precioExtras += precioReal * cantidad;
            extrasValidados.push({
              extraId: extraDTO.extraId,
              cantidad,
              precioUnitario: precioReal
            });
          }
        }
      }
    }
    
    const precioTotal = precioBase + precioExtras;
    
    // Validar anticipo
    const anticipoRecibido = Number(anticipo ?? 0);
    if (anticipoRecibido < 0 || anticipoRecibido > precioTotal) {
      throw new BadRequestException(`El anticipo debe estar entre $0 y $${precioTotal.toFixed(2)}`);
    }
    
    const restante = precioTotal - anticipoRecibido;
    
    // Validar estado inicial
    let estadoFinal = estadoInicial;
    if (estadoInicial === 'PAGO_PARCIAL' && anticipoRecibido === 0) {
      throw new BadRequestException('Estado PAGO_PARCIAL requiere anticipo > 0');
    }
    if (estadoInicial === 'CONFIRMADA' && restante > 0.01) {
      throw new BadRequestException('Estado CONFIRMADA requiere pago completo');
    }
    
    this.logger.log(
      `Reserva manual: precioBase=$${precioBase}, extras=$${precioExtras}, ` +
      `total=$${precioTotal}, anticipo=$${anticipoRecibido}, restante=$${restante}`
    );
    
    // ==========================================
    // CREAR RESERVA MANUAL
    // ==========================================
    
    const created = await this.prisma.reserva.create({
      data: {
        usuarioId: null, // Reservas manuales no tienen usuario asociado
        paqueteId,
        vehiculoId,
        conductorId: conductorId || null,
        nombre,
        email,
        telefono,
        identificacion: identificacion ?? null,
        notasInternas: notasInternas ?? null,
        tipoEvento,
        fechaEvento: fechaEventoDate,
        horaInicio: horaInicioDate,
        horaFin: horaFinDate,
        origen,
        destino,
        numeroPersonas,
        precioBase,
        precioTotal,
        anticipo: anticipoRecibido,
        restante,
        estado: estadoFinal,
        tipoPago: tipoPago as any,
        origenReserva: origenReserva || 'MANUAL', // Usar el origen especificado o MANUAL por defecto
      },
    });

    // Registrar extras
    if (extrasValidados.length > 0) {
      await this.prisma.reservaExtra.createMany({ 
        data: extrasValidados.map((x) => ({
          reservaId: created.id,
          extraId: x.extraId,
          cantidad: x.cantidad,
          precioUnitario: x.precioUnitario,
        }))
      });
    }

    // ==========================================
    // REGISTRAR EN HISTORIAL CON AUDITORÍA CLARA
    // ==========================================
    let mensajeAuditoria = comentario || `Reserva creada manualmente desde Admin por ${adminUser || 'Admin'}`;
    
    // Dejar claro si fue creada como pago completo
    if (estadoFinal === 'CONFIRMADA' && restante <= 0.01) {
      mensajeAuditoria = comentario 
        ? `${comentario} | ✓ PAGO COMPLETO MANUAL registrado por ${adminUser || 'Admin'}` 
        : `Reserva creada como PAGO COMPLETO MANUAL por ${adminUser || 'Admin'}. Origen: ${origenReserva || 'MANUAL'}. Total: $${precioTotal.toFixed(2)}`;
    } else if (estadoFinal === 'PAGO_PARCIAL') {
      mensajeAuditoria = comentario
        ? `${comentario} | Anticipo: $${anticipoRecibido.toFixed(2)} de $${precioTotal.toFixed(2)}`
        : `Reserva creada con anticipo parcial de $${anticipoRecibido.toFixed(2)} de $${precioTotal.toFixed(2)} por ${adminUser || 'Admin'}. Restante: $${restante.toFixed(2)}`;
    }

    await this.prisma.historialEstadoReserva.create({
      data: {
        reservaId: created.id,
        estado: estadoFinal,
        comentario: mensajeAuditoria,
        activo: 'ACTIVO',
      },
    });

    this.logger.log(
      `✅ Reserva manual #${created.id} creada por ${adminUser || 'Admin'} | ` +
      `Origen: ${origenReserva || 'MANUAL'} | Estado: ${estadoFinal} | ` +
      `Total: $${precioTotal.toFixed(2)} | Anticipo: $${anticipoRecibido.toFixed(2)} | Restante: $${restante.toFixed(2)}`
    );

    return this.toResponse(created);
  }

  /**
   * ========================================
   * ADMIN: MARCAR PAGO COMPLETO MANUAL
   * ========================================
   * Permite marcar una reserva como pagada al 100% aunque:
   * - No exista PagoReserva previo
   * - El pago haya sido externo (SINPE, transferencia, efectivo)
   */
  async markPaymentCompleteManual(id: string, dto: any, adminUser?: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva #${id} no encontrada`);
    }

    // Validar que no esté ya confirmada o completada
    if (reserva.estado === 'CONFIRMADA' || reserva.estado === 'COMPLETADA') {
      throw new BadRequestException(
        `No se puede marcar pago completo. Estado actual: ${reserva.estado}`
      );
    }

    // Validar que no haya conflictos
    const hasConflict = await this.hasConflict(
      reserva.id,
      reserva.vehiculoId,
      reserva.horaInicio,
      reserva.horaFin,
      reserva.estado
    );

    if (hasConflict) {
      throw new BadRequestException(
        'No se puede confirmar pago. La reserva tiene conflictos de horario'
      );
    }

    const precioTotal = Number(reserva.precioTotal);
    const { tipoPago, referenciaExterna, comentario } = dto;

    // ==========================================
    // CREAR REGISTRO DE PAGO
    // ==========================================
    await this.prisma.pagoReserva.create({
      data: {
        reservaId: id,
        monto: precioTotal,
        tipoPago: tipoPago as any,
        referenciaExterna: referenciaExterna || 'PAGO_MANUAL_ADMIN',
        estado: 'PAGADO',
        pagadoEn: new Date(),
      },
    });

    // ==========================================
    // ACTUALIZAR RESERVA
    // ==========================================
    const updated = await this.prisma.reserva.update({
      where: { id },
      data: {
        anticipo: precioTotal,
        restante: 0,
        estado: 'CONFIRMADA',
      },
    });

    // ==========================================
    // REGISTRAR EN HISTORIAL
    // ==========================================
    await this.prisma.historialEstadoReserva.create({
      data: {
        reservaId: id,
        estado: 'CONFIRMADA',
        comentario: comentario || `Pago completo marcado manualmente por ${adminUser || 'Admin'}. Referencia: ${referenciaExterna || 'N/A'}`,
        activo: 'ACTIVO',
      },
    });

    this.logger.log(
      `✅ Reserva #${id}: Pago completo marcado manualmente por ${adminUser || 'Admin'}. Total: $${precioTotal.toFixed(2)}`
    );

    // Enviar email de confirmación
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; }
            .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #c9a24d; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .box { background: #f5f5f5; padding: 20px; border-left: 4px solid #4caf50; margin: 20px 0; border-radius: 4px; }
            .box.highlight { background: #e8f5e9; border-left-color: #4caf50; }
            .amount { font-size: 28px; font-weight: bold; color: #1a1a2e; }
            .label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
            .footer { background: #1a1a2e; color: #c9a24d; padding: 20px; text-align: center; font-size: 12px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">¡Pago Confirmado!</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Reserva #${reserva.id}</p>
            </div>
            <div class="content">
              <p>Hola <strong>${reserva.nombre}</strong>,</p>
              <p>¡Excelente! Hemos recibido y confirmado tu pago completo. Tu reserva está <strong>CONFIRMADA</strong>.</p>
              
              <div class="box highlight">
                <div class="label">Pago Total Confirmado</div>
                <div class="amount">$${precioTotal.toFixed(2)}</div>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #2e7d32;">✓ Todo listo</p>
              </div>

              <div class="box">
                <p style="margin: 0 0 10px 0;"><strong>Próximos pasos:</strong></p>
                <p style="margin: 0;">Nuestro equipo se comunicará contigo en las próximas <strong>48 horas</strong> para coordinar los detalles finales.</p>
              </div>

              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">Número de reserva: <strong>#${reserva.id}</strong></p>
            </div>
            <div class="footer">
              <p>Moments Transportation CR</p>
              <p>¡Gracias por confiar en nosotros!</p>
            </div>
          </div>
        </body>
        </html>
      `;
      await this.emailService.sendEmail({
        to: reserva.email,
        subject: `¡Pago confirmado! - Reserva #${reserva.id} | Moments`,
        html: emailHtml,
      });
    } catch (error) {
      this.logger.error(`Error enviando email de confirmación:`, error);
    }

    return this.toResponse(updated);
  }

  /**
   * ========================================
   * ADMIN: EDITAR RESERVA (CONTROLADO)
   * ========================================
   */
  async updateReservation(id: string, dto: any, adminUser?: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva #${id} no encontrada`);
    }

    const changes: any = {};
    const comentarios: string[] = [];

    // Permitir cambiar conductor
    if (dto.conductorId !== undefined) {
      changes.conductorId = dto.conductorId || null;
      comentarios.push(`Conductor ${dto.conductorId ? 'asignado' : 'removido'}`);
    }

    // Permitir cambiar estado (con validaciones)
    if (dto.estado && dto.estado !== reserva.estado) {
      if (dto.estado === 'CANCELADA') {
        changes.estado = 'CANCELADA';
        comentarios.push(`Reserva cancelada por ${adminUser || 'Admin'}`);
      } else if (dto.estado === 'COMPLETADA' && reserva.estado === 'CONFIRMADA') {
        changes.estado = 'COMPLETADA';
        comentarios.push(`Servicio completado`);
      } else {
        throw new BadRequestException(`Cambio de estado no permitido: ${reserva.estado} → ${dto.estado}`);
      }
    }

    // Permitir cambiar horarios (validando conflictos)
    if (dto.horaInicio || dto.horaFin) {
      const horaInicio = dto.horaInicio ? new Date(dto.horaInicio) : reserva.horaInicio;
      const horaFin = dto.horaFin ? new Date(dto.horaFin) : reserva.horaFin;

      if (horaFin <= horaInicio) {
        throw new BadRequestException("horaFin debe ser mayor que horaInicio");
      }

      // Verificar conflictos con el nuevo horario
      const conflicting = await this.prisma.reserva.findFirst({
        where: {
          id: { not: id },
          vehiculoId: reserva.vehiculoId,
          estado: { in: ["PAGO_PENDIENTE", "PAGO_PARCIAL", "CONFIRMADA", "COMPLETADA"] },
          horaInicio: { lt: horaFin },
          horaFin: { gt: horaInicio },
        },
        select: { id: true },
      });

      if (conflicting) {
        throw new BadRequestException("Conflicto de horario con otra reserva");
      }

      changes.horaInicio = horaInicio;
      changes.horaFin = horaFin;
      comentarios.push(`Horario modificado`);
    }

    // Permitir cambiar vehículo (validando disponibilidad)
    if (dto.vehiculoId && dto.vehiculoId !== reserva.vehiculoId) {
      // Verificar conflictos con el nuevo vehículo
      const conflicting = await this.prisma.reserva.findFirst({
        where: {
          id: { not: id },
          vehiculoId: dto.vehiculoId,
          estado: { in: ["PAGO_PENDIENTE", "PAGO_PARCIAL", "CONFIRMADA", "COMPLETADA"] },
          horaInicio: { lt: reserva.horaFin },
          horaFin: { gt: reserva.horaInicio },
        },
        select: { id: true },
      });

      if (conflicting) {
        throw new BadRequestException("El nuevo vehículo no está disponible en ese horario");
      }

      changes.vehiculoId = dto.vehiculoId;
      comentarios.push(`Vehículo cambiado`);
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('No hay cambios para aplicar');
    }

    // Aplicar cambios
    const updated = await this.prisma.reserva.update({
      where: { id },
      data: changes,
    });

    // Registrar en historial
    await this.prisma.historialEstadoReserva.create({
      data: {
        reservaId: id,
        estado: updated.estado,
        comentario: `${comentarios.join(', ')} por ${adminUser || 'Admin'}${dto.comentario ? '. ' + dto.comentario : ''}`,
        activo: 'ACTIVO',
      },
    });

    this.logger.log(`✅ Reserva #${id} editada por ${adminUser || 'Admin'}: ${comentarios.join(', ')}`);

    return this.toResponse(updated);
  }

  // ==========================================
  // MÉTODOS PARA ESTADOS OPERATIVOS (TABLA ADMIN)
  // ==========================================

  /**
   * Actualiza el estado de contacto con el cliente
   */
  async updateContactoCliente(
    reservaId: string,
    contactoCliente: EstadoContacto,
    adminUser?: string,
  ) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, contactoCliente: true },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const estadoAnterior = reserva.contactoCliente;

    const updated = await this.prisma.reserva.update({
      where: { id: reservaId },
      data: { contactoCliente },
    });

    // Registrar auditoría
    await this.prisma.historialEstadoReserva.create({
      data: {
        reservaId,
        estado: updated.estado,
        comentario: `🔄 Contacto con cliente actualizado: ${estadoAnterior} → ${contactoCliente} por ${adminUser || 'Admin'}`,
        activo: 'ACTIVO',
      },
    });

    this.logger.log(`📞 Reserva #${reservaId}: Contacto ${estadoAnterior} → ${contactoCliente}`);

    return this.toResponse(updated);
  }

  /**
   * Actualiza si el adelanto fue recibido
   */
  async updateAdelantoRecibido(
    reservaId: string,
    adelantoRecibido: boolean,
    adminUser?: string,
  ) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, adelantoRecibido: true, anticipo: true },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const estadoAnterior = reserva.adelantoRecibido;

    const updated = await this.prisma.reserva.update({
      where: { id: reservaId },
      data: { adelantoRecibido },
    });

    // Registrar auditoría
    await this.prisma.historialEstadoReserva.create({
      data: {
        reservaId,
        estado: updated.estado,
        comentario: `💰 Adelanto ${adelantoRecibido ? 'RECIBIDO' : 'NO RECIBIDO'} ($${Number(reserva.anticipo).toFixed(2)}). Cambio: ${estadoAnterior ? 'Sí' : 'No'} → ${adelantoRecibido ? 'Sí' : 'No'} por ${adminUser || 'Admin'}`,
        activo: 'ACTIVO',
      },
    });

    this.logger.log(`💵 Reserva #${reservaId}: Adelanto ${estadoAnterior} → ${adelantoRecibido}`);

    return this.toResponse(updated);
  }

  /**
   * Actualiza si el pago está completo
   */
  async updatePagoCompleto(
    reservaId: string,
    pagoCompleto: boolean,
    adminUser?: string,
  ) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, pagoCompleto: true, precioTotal: true },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const estadoAnterior = reserva.pagoCompleto;

    const updated = await this.prisma.reserva.update({
      where: { id: reservaId },
      data: { pagoCompleto },
    });

    // Registrar auditoría
    await this.prisma.historialEstadoReserva.create({
      data: {
        reservaId,
        estado: updated.estado,
        comentario: `💳 PAGO COMPLETO ${pagoCompleto ? 'CONFIRMADO' : 'REVERTIDO'} ($${Number(reserva.precioTotal).toFixed(2)}). Cambio: ${estadoAnterior ? 'Sí' : 'No'} → ${pagoCompleto ? 'Sí' : 'No'} por ${adminUser || 'Admin'}`,
        activo: 'ACTIVO',
      },
    });

    this.logger.log(`✅ Reserva #${reservaId}: Pago completo ${estadoAnterior} → ${pagoCompleto}`);

    return this.toResponse(updated);
  }

  /**
   * Actualiza si el chofer fue asignado
   */
  async updateChoferAsignado(
    reservaId: string,
    choferAsignado: boolean,
    adminUser?: string,
  ) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, choferAsignado: true },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const estadoAnterior = reserva.choferAsignado;

    const updated = await this.prisma.reserva.update({
      where: { id: reservaId },
      data: { choferAsignado },
    });

    // Registrar auditoría
    await this.prisma.historialEstadoReserva.create({
      data: {
        reservaId,
        estado: updated.estado,
        comentario: `🚗 Chofer ${choferAsignado ? 'ASIGNADO' : 'NO ASIGNADO'}. Cambio: ${estadoAnterior ? 'Sí' : 'No'} → ${choferAsignado ? 'Sí' : 'No'} por ${adminUser || 'Admin'}`,
        activo: 'ACTIVO',
      },
    });

    this.logger.log(`👤 Reserva #${reservaId}: Chofer asignado ${estadoAnterior} → ${choferAsignado}`);

    return this.toResponse(updated);
  }

  /**
   * Actualiza si el evento fue realizado
   */
  async updateEventoRealizado(
    reservaId: string,
    eventoRealizado: boolean,
    adminUser?: string,
  ) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, eventoRealizado: true },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const estadoAnterior = reserva.eventoRealizado;

    const updated = await this.prisma.reserva.update({
      where: { id: reservaId },
      data: { eventoRealizado },
    });

    // Registrar auditoría
    await this.prisma.historialEstadoReserva.create({
      data: {
        reservaId,
        estado: updated.estado,
        comentario: `🎉 Evento ${eventoRealizado ? 'REALIZADO' : 'NO REALIZADO'}. Cambio: ${estadoAnterior ? 'Sí' : 'No'} → ${eventoRealizado ? 'Sí' : 'No'} por ${adminUser || 'Admin'}`,
        activo: 'ACTIVO',
      },
    });

    this.logger.log(`🎊 Reserva #${reservaId}: Evento realizado ${estadoAnterior} → ${eventoRealizado}`);

    return this.toResponse(updated);
  }

  /**
   * Lista todas las reservas con filtros, búsqueda y paginación (para tabla admin)
   */
  async findAllWithFilters(query: any) {
    const {
      vehiculoId,
      estadoPago,
      tipoEvento,
      origenReserva,
      contactoCliente,
      conConflictos,
      fechaDesde,
      fechaHasta,
      busqueda,
      sortBy = 'fechaEvento',
      sortOrder = 'asc',
      page = 1,
      limit = 25,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Construir WHERE clause
    const where: any = {};

    if (vehiculoId) {
      where.vehiculoId = vehiculoId;
    }

    if (estadoPago === 'pendiente') {
      where.estado = 'PAGO_PENDIENTE';
    } else if (estadoPago === 'parcial') {
      where.estado = 'PAGO_PARCIAL';
    } else if (estadoPago === 'completo') {
      where.pagoCompleto = true;
    }

    if (tipoEvento === 'futuro') {
      where.fechaEvento = { gte: new Date() };
    } else if (tipoEvento === 'hoy') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      where.fechaEvento = { gte: hoy, lt: manana };
    } else if (tipoEvento === 'pasado') {
      where.fechaEvento = { lt: new Date() };
    }

    if (origenReserva) {
      where.origenReserva = origenReserva;
    }

    if (contactoCliente) {
      where.contactoCliente = contactoCliente;
    }

    if (fechaDesde || fechaHasta) {
      where.fechaEvento = {};
      if (fechaDesde) where.fechaEvento.gte = new Date(fechaDesde);
      if (fechaHasta) where.fechaEvento.lte = new Date(fechaHasta);
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { email: { contains: busqueda, mode: 'insensitive' } },
        { telefono: { contains: busqueda } },
      ];
    }

    // Ordenamiento
    const orderBy: any = {};
    if (sortBy === 'fechaEvento') {
      orderBy.fechaEvento = sortOrder;
    } else if (sortBy === 'actualizadoEn') {
      orderBy.actualizadoEn = sortOrder;
    }

    // Ejecutar query
    const [reservas, total] = await Promise.all([
      this.prisma.reserva.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          paquete: {
            select: {
              id: true,
              nombre: true,
              precioBase: true,
            },
          },
          vehiculo: {
            select: {
              id: true,
              nombre: true,
              categoria: true,
            },
          },
          conductor: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
            },
          },
          extras: { 
            include: { 
              extra: { select: { nombre: true, precio: true, categoria: true } } 
            } 
          },
          incluidos: { 
            include: { 
              incluido: { 
                select: { nombre: true, descripcion: true, categoria: { select: { nombre: true } } } 
              } 
            } 
          },
        },
      }),
      this.prisma.reserva.count({ where }),
    ]);

    // Detectar conflictos si es necesario
    let reservasConConflictos = reservas;
    if (conConflictos !== undefined) {
      const reservasConFlags = await Promise.all(
        reservas.map(async (r) => {
          const conflicto = await this.prisma.reserva.findFirst({
            where: {
              vehiculoId: r.vehiculoId,
              id: { not: r.id },
              estado: {
                in: ['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA', 'COMPLETADA'],
              },
              horaInicio: { lt: r.horaFin },
              horaFin: { gt: r.horaInicio },
            },
            select: { id: true },
          });
          return { ...r, tieneConflicto: !!conflicto };
        }),
      );

      if (conConflictos) {
        reservasConConflictos = reservasConFlags.filter((r: any) => r.tieneConflicto);
      } else {
        reservasConConflictos = reservasConFlags;
      }
    }

    return {
      data: reservasConConflictos.map((r) => this.toResponse(r)),
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    };
  }
}

