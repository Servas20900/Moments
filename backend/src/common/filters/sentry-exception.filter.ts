import { ArgumentsHost, Catch, HttpException, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import * as Sentry from "@sentry/node";

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  override catch(exception: unknown, host: ArgumentsHost) {
    try {
      const isHttpException = exception instanceof HttpException;
      const status = isHttpException ? exception.getStatus?.() : undefined;
      Sentry.captureException(exception, { tags: { status: status?.toString() ?? "unknown" } });
    } catch (err) {
      this.logger.warn(`Sentry capture failed: ${(err as Error)?.message}`);
    }

    super.catch(exception, host);
  }
}