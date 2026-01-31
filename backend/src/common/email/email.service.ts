import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

interface ReservationEmailData {
  nombre: string;
  email: string;
  reservaId: string;
  anticipo: number;
  total: number;
  fecha: Date;
  horaInicio: Date;
  origen: string;
  destino: string;
  numeroPersonas: number;
  paquete: string;
  telefono?: string;
  direccion?: string;
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
        subject: `Reserva Confirmada - Número ${data.reservaId} | Moments`,
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

    const depositoFormato = `₡${data.anticipo.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const totalFormato = `₡${data.total.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const restanteFormato = `₡${(data.total - data.anticipo).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
      <h1>✓ Reserva Confirmada</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Número: <strong>#${data.reservaId}</strong></p>
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
        </div>
      </div>

      <!-- Resumen de Precios -->
      <div class="section">
        <h2>Resumen de Pago</h2>
        <div class="payment-box">
          <div class="payment-item">
            <span>Subtotal</span>
            <span>${totalFormato}</span>
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

      <!-- Instrucciones de SINPE -->
      <div class="section">
        <h2>Próximos Pasos - SINPE Móvil</h2>
        <div class="sinpe-instructions">
          <h3>📱 Realiza el SINPE Móvil</h3>
          <p>Envía el anticipo (50% del total) al siguiente número:</p>
          <div class="sinpe-phone">${this.SINPE_PHONE}</div>
          <p style="margin: 10px 0 0 0; font-size: 14px;">
            <strong>A nombre de:</strong> ${this.COMPANY_NAME}
          </p>

          <h3 style="margin-top: 20px;">📧 Pasos para Completar tu Pago</h3>
          <ol class="steps">
            <li><strong>Realiza el pago:</strong> Envía el SINPE Móvil con el monto ${depositoFormato}</li>
            <li><strong>Toma captura:</strong> Guarda una captura de pantalla del comprobante</li>
            <li><strong>Envía el comprobante:</strong> Envíalo a <a href="mailto:${this.COMPANY_EMAIL}?subject=Comprobante%20Reserva%20${data.reservaId}">pagos@moments.cr</a> con el asunto "Comprobante Reserva #${data.reservaId}"</li>
            <li><strong>Espera confirmación:</strong> Te enviaremos un correo en máximo 24 horas confirmando tu reserva</li>
          </ol>
        </div>
      </div>

      <!-- Coordinación Pickup -->
      <div class="section">
        <h2>Coordinación de Recogida</h2>
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px;">
          <p style="margin-top: 0;">⚠️ <strong>Importante:</strong> Nos pondremos en contacto contigo 48 horas antes de tu reserva para coordinar la hora y lugar exacto de recogida.</p>
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
      <p>${this.COMPANY_EMAIL}</p>
      <p style="color: #999;">© ${new Date().getFullYear()} Todos los derechos reservados</p>
      <p style="color: #999; font-size: 11px;">Este es un correo automático. Por favor no respondas a esta dirección.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
