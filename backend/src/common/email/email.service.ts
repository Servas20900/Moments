import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

interface ReservationEmailData {
  nombre: string;
  email: string;
  reservaId: string;
  numeroFactura: string | null;
  anticipo: number;
  total: number;
  restante?: number;
  fecha: Date;
  horaInicio: Date;
  horaFin?: Date;
  origen: string;
  destino: string;
  numeroPersonas: number;
  paquete: string;
  vehiculo?: string;
  telefono?: string;
  direccion?: string;
  tipoIdentificacion?: string;
  tipoEvento?: string;
  precioBase?: number;
  precioExtras?: number;
  identificacion?: string;
  notasInternas?: string;
  origenReserva?: string;
  tipoPago?: string;
  estadoPago?: string;
  extras?: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  incluidos?: Array<{
    id: string;
    nombre: string;
    descripcion?: string;
    categoria: {
      id: number;
      nombre: string;
    };
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly SINPE_PHONE = process.env.SINPE_PHONE || '8888-8888';
  private readonly COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'pagos@moments.cr';
  private readonly COMPANY_NAME = 'Moments Transportation CR';
  private transporter: Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.setupTransport();
  }

  async sendReservationConfirmation(data: ReservationEmailData): Promise<boolean> {
    try {
      const htmlContent = this.buildReservationEmailHTML(data);

      if (!this.transporter) {
        this.logger.error('No hay transporter SMTP configurado. Revisa las variables SMTP_HOST/SMTP_USER/SMTP_PASS.');
        return false;
      }

      await this.transporter.sendMail({
        to: data.email,
        from: this.COMPANY_EMAIL,
        subject: `Reserva Confirmada - Factura ${data.numeroFactura || data.reservaId} | Moments`,
        html: htmlContent,
        replyTo: this.COMPANY_EMAIL,
      });
      this.logger.log(`Correo de confirmación enviado a ${data.email} (Reserva: ${data.reservaId})`);
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${data.email}:`, error);
      return false;
    }
  }

  async sendAdminReservationNotification(data: ReservationEmailData): Promise<boolean> {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || this.COMPANY_EMAIL;
      const htmlContent = this.buildAdminReservationEmailHTML(data);

      if (!this.transporter) {
        this.logger.error('No hay transporter SMTP configurado para notificación admin.');
        return false;
      }

      await this.transporter.sendMail({
        to: adminEmail,
        from: this.COMPANY_EMAIL,
        subject: `Nueva Reserva - Factura #${data.numeroFactura || data.reservaId} | Administrador Sistema`,
        html: htmlContent,
        replyTo: this.COMPANY_EMAIL,
      });
      this.logger.log(`Notificación admin enviada para reserva #${data.reservaId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar notificación admin para reserva #${data.reservaId}:`, error);
      return false;
    }
  }

  async sendEmail(options: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.error('No hay transporter SMTP configurado.');
        return false;
      }

      await this.transporter.sendMail({
        to: options.to,
        from: this.COMPANY_EMAIL,
        subject: options.subject,
        html: options.html,
        replyTo: this.COMPANY_EMAIL,
      });
      this.logger.log(`Correo enviado a ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${options.to}:`, error);
      return false;
    }
  }

  private setupTransport() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP_HOST/SMTP_USER/SMTP_PASS no están configurados; no se podrá enviar correo.');
      return;
    }

    const secure = port === 465; // Gmail SSL usa 465; TLS usa 587
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    this.transporter
      .verify()
      .then(() => this.logger.log('SMTP transporter listo para enviar correos'))
      .catch((err: Error) => this.logger.error('Error verificando transporter SMTP:', err));
  }

  private buildReservationEmailHTML(data: ReservationEmailData): string {
    const fechaFormato = new Date(data.fecha).toLocaleDateString('es-CR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const horaInicio = new Date(data.horaInicio).toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const horaFin = data.horaFin ? new Date(data.horaFin).toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    }) : 'Por confirmar';

    const depositoFormato = `₡${data.anticipo.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const totalFormato = `₡${data.total.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const restante = data.restante ?? (data.total - data.anticipo);
    const restanteFormato = `₡${restante.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const precioBaseFormato = data.precioBase 
      ? `₡${data.precioBase.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : totalFormato;
    
    const precioExtrasFormato = data.precioExtras && data.precioExtras > 0
      ? `₡${data.precioExtras.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '₡0.00';

    const extrasHTML = data.extras && data.extras.length > 0
      ? `<div class="section">
          <h2>Extras Seleccionados</h2>
          <div class="payment-box">
            ${data.extras.map((extra) => `
              <div class="payment-item">
                <span>${extra.nombre} (x${extra.cantidad})</span>
                <span>₡${extra.precio.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            `).join('')}
          </div>
        </div>`
      : '';

    const vehiculoHTML = data.vehiculo 
      ? `<div class="info-item">
          <div class="info-label">Vehículo</div>
          <div class="info-value">${data.vehiculo}</div>
        </div>`
      : '';

    const tipoEventoHTML = data.tipoEvento
      ? `<div class="info-item">
          <div class="info-label">Tipo de Evento</div>
          <div class="info-value">${data.tipoEvento}</div>
        </div>`
      : '';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva - Moments</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 0;
    }
    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #c9a24d;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .section {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section h2 {
      font-size: 18px;
      color: #1a1a2e;
      margin: 0 0 15px 0;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 1px;
      color: #c9a24d;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-item {
      background-color: #f9f9f9;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #c9a24d;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
    }
    .highlight {
      background-color: #fff3cd;
      border-left-color: #ffc107;
      border: 1px solid #ffc107;
    }
    .payment-box {
      background: linear-gradient(135deg, #f0f0f0 0%, #f9f9f9 100%);
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .payment-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .payment-item:last-child {
      border-bottom: none;
    }
    .payment-total {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      border-top: 2px solid #c9a24d;
    }
    .sinpe-instructions {
      background-color: #e8f5e9;
      border: 2px solid #4caf50;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .sinpe-instructions h3 {
      color: #2e7d32;
      margin-top: 0;
    }
    .sinpe-phone {
      background-color: white;
      border: 2px dashed #4caf50;
      padding: 15px;
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
      font-family: 'Courier New', monospace;
      border-radius: 6px;
      margin: 15px 0;
    }
    .steps {
      list-style: none;
      padding: 0;
      margin: 15px 0;
    }
    .steps li {
      padding: 12px;
      margin-bottom: 10px;
      background-color: #f5f5f5;
      border-left: 4px solid #4caf50;
      border-radius: 4px;
    }
    .steps strong {
      color: #2e7d32;
    }
    .footer {
      background-color: #1a1a2e;
      color: #c9a24d;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
    .button {
      display: inline-block;
      background-color: #c9a24d;
      color: #1a1a2e;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 15px 0;
    }
    .divider {
      border-top: 1px solid #ddd;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reserva Confirmada</h1>
      ${data.numeroFactura ? `<p style="margin: 10px 0 0 0; font-size: 14px;">Factura #<strong>${data.numeroFactura}</strong></p>` : '<p style="margin: 10px 0 0 0; font-size: 14px;">Factura: <strong>Pendiente</strong></p>'}
    </div>

    <div class="content">
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <p>¡Gracias por reservar con nosotros! Tu reserva ha sido creada exitosamente. A continuación encontrarás los detalles y los próximos pasos.</p>

      <!-- Detalles de la Reserva -->
      <div class="section">
        <h2>Detalles de tu Reserva</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Paquete</div>
            <div class="info-value">${data.paquete}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Fecha</div>
            <div class="info-value">${fechaFormato}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Hora de Salida</div>
            <div class="info-value">${horaInicio}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Hora de Llegada</div>
            <div class="info-value">${horaFin}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Personas</div>
            <div class="info-value">${data.numeroPersonas}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Origen</div>
            <div class="info-value">${data.origen}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Destino</div>
            <div class="info-value">${data.destino}</div>
          </div>
          ${vehiculoHTML}
          ${tipoEventoHTML}
        </div>
      </div>

      <!-- Resumen de Precios -->
      <div class="section">
        <h2>Resumen de Pago</h2>
        <div class="payment-box">
          <div class="payment-item">
            <span>Paquete Base</span>
            <span>${precioBaseFormato}</span>
          </div>
          ${data.precioExtras && data.precioExtras > 0 ? `
          <div class="payment-item">
            <span>Extras</span>
            <span>${precioExtrasFormato}</span>
          </div>
          ` : ''}
          <div class="payment-item">
            <span style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">Subtotal</span>
            <span style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">${totalFormato}</span>
          </div>
          <div class="payment-item highlight">
            <strong>Anticipo Requerido (50%)</strong>
            <strong>${depositoFormato}</strong>
          </div>
          <div class="payment-item">
            <span>A Pagar Antes del Servicio</span>
            <span>${restanteFormato}</span>
          </div>
          <div class="payment-total">
            <span>Total</span>
            <span>${totalFormato}</span>
          </div>
        </div>
      </div>

      ${extrasHTML}

      <!-- Instrucciones de SINPE -->
      <div class="section">
        <h2>Próximos Pasos - SINPE Móvil</h2>
        <div class="sinpe-instructions">
          <h3>Realiza el SINPE Móvil</h3>
          <p>Envía el anticipo (50% del total) al siguiente número:</p>
          <div class="sinpe-phone">${this.SINPE_PHONE}</div>
          <p style="margin: 10px 0 0 0; font-size: 14px;">
            <strong>A nombre de:</strong> ${this.COMPANY_NAME}
          </p>

          <h3 style="margin-top: 20px;">Pasos para Completar tu Pago</h3>
          <ol class="steps">
            <li><strong>Realiza el pago:</strong> Envía el SINPE Móvil con el monto ${depositoFormato}</li>
            <li><strong>Toma captura:</strong> Guarda una captura de pantalla del comprobante</li>
            <li><strong>Envía el comprobante:</strong> Envíalo a <a href="mailto:${this.COMPANY_EMAIL}?subject=Comprobante%20Factura%20${data.numeroFactura || data.reservaId}">pagos@moments.cr</a> con el asunto "Comprobante Factura ${data.numeroFactura || data.reservaId}"</li>
            <li><strong>Espera confirmación:</strong> Te enviaremos un correo en máximo 24 horas confirmando tu reserva</li>
          </ol>
        </div>
      </div>

      <!-- Coordinación Pickup -->
      <div class="section">
        <h2>Coordinación de Recogida</h2>
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px;">
          <p style="margin-top: 0;"><strong>Importante:</strong> Nos pondremos en contacto contigo 48 horas antes de tu reserva para coordinar la hora y lugar exacto de recogida.</p>
          <p>Asegúrate de tener tu teléfono disponible: <strong>${data.telefono || 'No proporcionado'}</strong></p>
        </div>
      </div>

      <!-- Información General -->
      <div class="section">
        <h2>Información Adicional</h2>
        <p><strong>Dirección del Cliente:</strong> ${data.direccion || 'No proporcionada'}</p>
        <p><strong>Email de Confirmación:</strong> ${data.email}</p>
        <p style="color: #666; font-size: 14px;">Si necesitas cambiar tu reserva o tienes preguntas, responde este correo o contacta a ${this.COMPANY_EMAIL}</p>
      </div>

      <!-- Términos y Condiciones -->
      <div class="section" style="background-color: #f5f5f5; padding: 15px; border-radius: 6px;">
        <h2>Términos y Condiciones</h2>
        <p style="font-size: 13px; margin: 0;">Al completar este pago, aceptas nuestros términos y condiciones de servicio. Lee nuestras políticas de cancelación y cambios en tu perfil de cliente.</p>
        <p style="font-size: 13px; color: #666;">
          <strong>Política de Cancelación:</strong> Las cancelaciones realizadas 7 días antes del servicio tendrán reembolso del 100%. Cancelaciones con menor antelación no aplican reembolso.
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>Moments Transportation CR</strong></p>
      <p>Teléfono: ${this.SINPE_PHONE} | Email: ${this.COMPANY_EMAIL}</p>
      <p>© 2026 Moments Transportation CR. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private buildAdminReservationEmailHTML(data: ReservationEmailData): string {
    const fechaFormato = new Date(data.fecha).toLocaleDateString('es-CR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const horaInicio = new Date(data.horaInicio).toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const horaFin = data.horaFin ? new Date(data.horaFin).toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    }) : 'Por confirmar';

    const depositoFormato = `₡${data.anticipo.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const totalFormato = `₡${data.total.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const restante = data.restante ?? (data.total - data.anticipo);
    const restanteFormato = `₡${restante.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Reserva - Moments Admin</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 0;
    }
    .header {
      background: linear-gradient(135deg, #c9a24d 0%, #e0bc6a 100%);
      color: #1a1a2e;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .section {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section h2 {
      font-size: 16px;
      color: #1a1a2e;
      margin: 0 0 15px 0;
      text-transform: uppercase;
      font-size: 13px;
      letter-spacing: 1px;
      color: #c9a24d;
      font-weight: 700;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-item {
      background-color: #f9f9f9;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #c9a24d;
    }
    .info-label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
    }
    .highlight {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
    }
    .alert {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .payment-info {
      background-color: #e8f5e9;
      border: 1px solid #4caf50;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .payment-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #c8e6c9;
    }
    .payment-item:last-child {
      border-bottom: none;
    }
    .payment-total {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      font-size: 16px;
      font-weight: 700;
      color: #1b5e20;
      border-top: 2px solid #4caf50;
      margin-top: 10px;
    }
    .client-info {
      background-color: #f0f0f0;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .footer {
      background-color: #1a1a2e;
      color: #c9a24d;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nueva Reserva Recibida</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px;">
        ${data.numeroFactura ? `Factura #<strong>${data.numeroFactura}</strong>` : 'Factura: <strong>Pendiente</strong>'}
      </p>
    </div>

    <div class="content">
      <div class="alert">
        <strong>Accion requerida:</strong> Confirma la disponibilidad y contacta al cliente dentro de 24 horas.
      </div>

      <!-- Estado de Origen --> 
      <div class="section">
        <h2>Información de Reserva</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Origen de Reserva</div>
            <div class="info-value">${data.origenReserva || 'WEB'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Método de Pago</div>
            <div class="info-value">${data.tipoPago || 'SINPE'}</div>
          </div>
        </div>
      </div>

      <!-- Estado de Pago CRÍTICO -->
      <div class="section">
        <h2>Estado de Pago - ACCIÓN REQUERIDA</h2>
        <div class="payment-info">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 2px solid #ff9800; border-radius: 6px; background-color: #fff3e0;">
            <div>
              <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Estado Actual</div>
              <div style="font-size: 18px; font-weight: 700; color: #ff6f00;">
                ${data.estadoPago === 'PAGO_PENDIENTE' ? 'PAGO PENDIENTE' : 
                  data.estadoPago === 'PAGO_PARCIAL' ? 'PAGO PARCIAL' :
                  data.estadoPago === 'CONFIRMADA' ? 'CONFIRMADA' : data.estadoPago}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #666;">Anticipo Pendiente:</div>
              <div style="font-size: 16px; font-weight: 700; color: #d32f2f;">${depositoFormato}</div>
            </div>
          </div>
          
          <div class="payment-item" style="margin-top: 15px;">
            <span style="color: #666;">Pago Requerido:</span>
            <span><strong>${depositoFormato}</strong> (50% del total)</span>
          </div>
          <div class="payment-item">
            <span style="color: #666;">Monto Total:</span>
            <span><strong>${totalFormato}</strong></span>
          </div>
          <div class="payment-item ${data.estadoPago === 'PAGO_PENDIENTE' ? 'highlight' : ''}">
            <span style="color: #d32f2f; font-weight: bold;">Saldo Pendiente:</span>
            <span style="color: #d32f2f; font-weight: bold;">${restanteFormato}</span>
          </div>
        </div>
      </div>

      
      <div class="section">
        <h2>Información del Cliente</h2>
        <div class="client-info">
          <p><strong>${data.nombre}</strong></p>
          <p>Email: <a href="mailto:${data.email}">${data.email}</a></p>
          <p>Teléfono: <strong>${data.telefono || 'No proporcionado'}</strong></p>
          ${data.tipoIdentificacion ? `<p>Tipo de Identificación: <strong>${data.tipoIdentificacion}</strong></p>` : ''}
          <p>Identificación: <strong>${data.identificacion || 'No proporcionada'}</strong></p>
          <p>Dirección: <strong>${data.direccion || 'No proporcionada'}</strong></p>
        </div>
      </div>

      <!-- Detalles de la Reserva -->
      <div class="section">
        <h2>Detalles del Evento</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Paquete</div>
            <div class="info-value">${data.paquete}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Tipo de Evento</div>
            <div class="info-value">${data.tipoEvento || 'No especificado'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Fecha</div>
            <div class="info-value">${fechaFormato}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Personas</div>
            <div class="info-value">${data.numeroPersonas}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Origen</div>
            <div class="info-value">${data.origen}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Destino</div>
            <div class="info-value">${data.destino}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Hora Salida</div>
            <div class="info-value">${horaInicio}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Hora Llegada</div>
            <div class="info-value">${horaFin}</div>
          </div>
          ${data.vehiculo ? `
          <div class="info-item">
            <div class="info-label">Vehículo</div>
            <div class="info-value">${data.vehiculo}</div>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Resumen de Precios -->
      <div class="section">
        <h2>Resumen Financiero</h2>
        <div class="payment-info">
          <div class="payment-item">
            <span>Paquete Base</span>
            <span>${data.precioBase ? `₡${data.precioBase.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : totalFormato}</span>
          </div>
          ${data.precioExtras && data.precioExtras > 0 ? `
          <div class="payment-item">
            <span>Extras</span>
            <span>₡${data.precioExtras.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          ` : ''}
          <div class="payment-item">
            <strong>Anticipo Recibido (50%)</strong>
            <strong>${depositoFormato}</strong>
          </div>
          <div class="payment-item">
            <span>Pendiente de cobro</span>
            <span>${restanteFormato}</span>
          </div>
          <div class="payment-total">
            <span>Total</span>
            <span>${totalFormato}</span>
          </div>
        </div>
      </div>

      ${data.extras && data.extras.length > 0 ? `
      <!-- Extras Seleccionados -->
      <div class="section">
        <h2>Extras Seleccionados</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f0f0f0; border-bottom: 2px solid #c9a24d;">
              <th style="text-align: left; padding: 10px; font-weight: 600;">Extra</th>
              <th style="text-align: center; padding: 10px; font-weight: 600;">Cantidad</th>
              <th style="text-align: right; padding: 10px; font-weight: 600;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${data.extras.map(extra => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px;">${extra.nombre}</td>
              <td style="text-align: center; padding: 10px;">${extra.cantidad}</td>
              <td style="text-align: right; padding: 10px;">₡${extra.precio.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : `
      <!-- Extras: NINGUNO SELECCIONADO -->
      <div class="section">
        <h2>Extras Seleccionados</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; text-align: center; color: #999;">
          <p style="margin: 0;">El cliente no seleccionó extras adicionales</p>
        </div>
      </div>
      `}

      ${data.incluidos && data.incluidos.length > 0 ? (() => {
        // Agrupar incluidos por categoría
        const incluidosPorCategoria = data.incluidos.reduce((acc, incl) => {
          const catKey = incl.categoria.nombre;
          if (!acc[catKey]) {
            acc[catKey] = [];
          }
          acc[catKey].push(incl);
          return acc;
        }, {} as Record<string, typeof data.incluidos>);

        return `
      <!-- Bebidas e Incluidos por Categoría -->
      <div class="section">
        <h2>Bebidas e Incluidos Seleccionados</h2>
        ${Object.entries(incluidosPorCategoria).map(([categoria, items]) => `
        <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
          <div style="background-color: #c9a24d; color: #1a1a2e; padding: 12px; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">
            ${categoria}
          </div>
          <div style="background-color: #f9f9f9; padding: 15px;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${items.map(item => `
              <li style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;">
                <span style="color: #4caf50; font-weight: bold; font-size: 16px;">-</span>
                <div>
                  <div style="font-weight: 600; color: #333;">${item.nombre}</div>
                  ${item.descripcion ? `<div style="font-size: 12px; color: #666;">${item.descripcion}</div>` : ''}
                </div>
              </li>
              `).join('')}
            </ul>
          </div>
        </div>
        `).join('')}
      </div>
        `;
      })() : `
      <!-- Incluidos: NINGUNO SELECCIONADO -->
      <div class="section">
        <h2>Bebidas e Incluidos Seleccionados</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; text-align: center; color: #999;">
          <p style="margin: 0;">El cliente no seleccionó bebidas ni incluidos (revisar requisitos del paquete)</p>
        </div>
      </div>
      `}
      

      ${data.notasInternas ? `
      <!-- Notas Adicionales -->
      <div class="section">
        <h2>Notas y Solicitudes Especiales del Cliente</h2>
        <div style="background-color: #f0f2f5; border-left: 4px solid #c9a24d; padding: 15px; border-radius: 4px;">
          <p style="margin: 0; white-space: pre-line; color: #333;">${data.notasInternas}</p>
        </div>
      </div>
      ` : `
      <!-- Notas: NINGUNA -->
      <div class="section">
        <h2>Notas y Solicitudes Especiales</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; text-align: center; color: #999;">
          <p style="margin: 0;">El cliente no escribió notas especiales</p>
        </div>
      </div>
      `}

      <!-- CONFIRMACIÓN FINAL DE LA RESERVA -->
      <div class="section" style="border: 3px solid #4caf50; background-color: #e8f5e9; border-radius: 6px; padding: 20px;">
        <h2 style="color: #2e7d32; margin-top: 0;">Confirmación Final del Cliente</h2>
        <div style="color: #2e7d32; line-height: 1.8;">
          <p style="margin: 10px 0;">
            <strong>Esta es la información CONFIRMADA por el cliente en la vista de pago.</strong>
          </p>
          <p style="margin: 10px 0; font-size: 14px;">
            El cliente ha revisado y validado:
          </p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Paquete y categoría del evento</li>
            <li>${data.incluidos && data.incluidos.length > 0 ? `Bebidas e incluidos por categoría (${data.incluidos.length} items)` : 'Bebidas e incluidos (ninguno seleccionado)'}</li>
            ${data.extras && data.extras.length > 0 ? `<li>Extras adicionales (${data.extras.length} items)</li>` : ''}
            <li>Notas y solicitudes especiales</li>
            <li>Información de contacto y detalles del evento</li>
            <li>Resumen financiero y términos de pago</li>
          </ul>
          <p style="margin: 15px 0 0 0; font-size: 13px; color: #666;">
            <strong>Hora de confirmación:</strong> ${new Date(data.fecha).toLocaleDateString('es-CR')} ${new Date().toLocaleTimeString('es-CR')}
          </p>
        </div>
      </div>

      <!-- Próximos Pasos Operacionales -->
      <div class="section">
        <h2>Checklist Operativo</h2>
        <div style="background-color: #f5f5f5; border-radius: 6px; padding: 0;">
          <div style="border-bottom: 1px solid #e0e0e0; padding: 15px; display: flex; gap: 10px; align-items: flex-start;">
            <div style="color: #c9a24d; font-size: 18px; font-weight: bold;">[]</div>
            <div>
              <div style="font-weight: 600; color: #333; margin-bottom: 5px;">Confirmar Pago</div>
              <div style="font-size: 12px; color: #666;">Verifique que el cliente envíe el comprobante de SINPE por ${depositoFormato}</div>
            </div>
          </div>
          <div style="border-bottom: 1px solid #e0e0e0; padding: 15px; display: flex; gap: 10px; align-items: flex-start;">
            <div style="color: #c9a24d; font-size: 18px; font-weight: bold;">[]</div>
            <div>
              <div style="font-weight: 600; color: #333; margin-bottom: 5px;">Contactar Cliente (24h)</div>
              <div style="font-size: 12px; color: #666;">Llame/WhatsApp a ${data.telefono} para confirmar disponibilidad y guardar punto de recogida</div>
            </div>
          </div>
          <div style="border-bottom: 1px solid #e0e0e0; padding: 15px; display: flex; gap: 10px; align-items: flex-start;">
            <div style="color: #c9a24d; font-size: 18px; font-weight: bold;">[]</div>
            <div>
              <div style="font-weight: 600; color: #333; margin-bottom: 5px;">Confirmar Incluidos</div>
              <div style="font-size: 12px; color: #666;">Verifique disponibilidad de TODAS las bebidas e incluidos seleccionados</div>
            </div>
          </div>
          <div style="border-bottom: 1px solid #e0e0e0; padding: 15px; display: flex; gap: 10px; align-items: flex-start;">
            <div style="color: #c9a24d; font-size: 18px; font-weight: bold;">[]</div>
            <div>
              <div style="font-weight: 600; color: #333; margin-bottom: 5px;">Asignar Vehículo</div>
              <div style="font-size: 12px; color: #666;">Conforme que ${data.vehiculo || 'el vehículo'} está disponible en el horario ${horaInicio} - ${horaFin}</div>
            </div>
          </div>
          <div style="border-bottom: 1px solid #e0e0e0; padding: 15px; display: flex; gap: 10px; align-items: flex-start;">
            <div style="color: #c9a24d; font-size: 18px; font-weight: bold;">[]</div>
            <div>
              <div style="font-weight: 600; color: #333; margin-bottom: 5px;">Asignar Conductor</div>
              <div style="font-size: 12px; color: #666;">Seleccione un conductor disponible para la fecha y registre los detalles</div>
            </div>
          </div>
          <div style="padding: 15px; display: flex; gap: 10px; align-items: flex-start;">
            <div style="color: #c9a24d; font-size: 18px; font-weight: bold;">[]</div>
            <div>
              <div style="font-weight: 600; color: #333; margin-bottom: 5px;">Coordinación Final (48h antes)</div>
              <div style="font-size: 12px; color: #666;">Confirme con el cliente todos los detalles finales: hora exacta, punto de recogida, cambios de última hora</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Moments Transportation CR - Panel Admin</strong></p>
      <p>© 2026 Moments Transportation CR. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
