import { INestApplication } from "@nestjs/common";
import { HttpExceptionFilter } from "../common/filters/http-exception.filter";
import { PrismaExceptionFilter } from "../common/filters/prisma-exception.filter";
import { AllExceptionsFilter } from "../common/filters/all-exceptions.filter";

export function setupFilters(app: INestApplication): void {
  // Global exception filters - specific order: most specific to most general
  app.useGlobalFilters(
    new HttpExceptionFilter(), // Handles HttpException
    new PrismaExceptionFilter(), // Handles Prisma/DB errors
    new AllExceptionsFilter(), // Catch-all + Sentry
  );
}
