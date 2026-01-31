import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as Sentry from "@sentry/node";

/**
 * Filtro global catch-all para capturar cualquier excepción no manejada
 * Integra con Sentry para tracking de errores
 * Debe registrarse como último filtro en la cadena
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Error interno del servidor";
    let stack: string | undefined;

    // Si es HttpException, extraer info
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    }
    // Si es Error genérico
    else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }
    // Si es algo desconocido
    else {
      message = String(exception);
    }

    // Enviar a Sentry solo errores 5xx o excepciones no HTTP
    if (status >= 500 || !(exception instanceof HttpException)) {
      try {
        Sentry.captureException(exception, {
          tags: {
            status: status.toString(),
            path: request.url,
            method: request.method,
          },
          extra: {
            body: request.body,
            query: request.query,
            params: request.params,
          },
        });
      } catch (err) {
        this.logger.warn(
          `Failed to send exception to Sentry: ${(err as Error)?.message}`,
        );
      }
    }

    // Log según severidad
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}: ${message}`,
        stack || (exception instanceof Error ? exception.stack : undefined),
      );
    } else if (status >= 400) {
      this.logger.warn(`${request.method} ${request.url} - ${status}: ${message}`);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
      error: HttpStatus[status] || "INTERNAL_SERVER_ERROR",
    };

    // En producción, ocultar detalles sensibles
    if (process.env.NODE_ENV === "production" && status >= 500) {
      errorResponse.message = ["Ha ocurrido un error. Por favor, intente nuevamente."];
    }

    response.status(status).json(errorResponse);
  }
}
