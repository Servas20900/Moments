import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response, Request } from "express";

/**
 * Filtro para convertir errores de Prisma en respuestas HTTP apropiadas
 * Mapea códigos de error de Prisma a códigos HTTP y mensajes amigables
 */
@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientUnknownRequestError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError
      | Prisma.PrismaClientUnknownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Error interno del servidor";

    // Prisma Known Errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case "P2000":
          status = HttpStatus.BAD_REQUEST;
          message = "El valor proporcionado es demasiado largo para la columna";
          break;
        case "P2001":
          status = HttpStatus.NOT_FOUND;
          message = "El registro buscado no existe";
          break;
        case "P2002":
          status = HttpStatus.CONFLICT;
          const target = (exception.meta?.target as string[]) || [];
          message = `Ya existe un registro con ${target.join(", ")} duplicado`;
          break;
        case "P2003":
          status = HttpStatus.BAD_REQUEST;
          message = "Fallo en constraint de clave foránea";
          break;
        case "P2025":
          status = HttpStatus.NOT_FOUND;
          message = "El registro a actualizar/eliminar no fue encontrado";
          break;
        case "P2014":
          status = HttpStatus.BAD_REQUEST;
          message = "La relación viola una constraint de integridad";
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Error en base de datos: ${exception.code}`;
      }
      this.logger.warn(
        `Prisma error [${exception.code}] on ${request.method} ${request.url}: ${exception.message}`,
      );
    }
    // Prisma Validation Errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = "Datos inválidos para la operación";
      this.logger.warn(
        `Prisma validation error on ${request.method} ${request.url}`,
      );
    }
    // Unknown Request Errors
    else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Error desconocido en la base de datos";
      this.logger.error(
        `Prisma unknown error on ${request.method} ${request.url}`,
        exception.message,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: [message],
      error: HttpStatus[status],
    });
  }
}
