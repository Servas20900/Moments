import { INestApplication } from "@nestjs/common";
import helmet from "helmet";
import * as Sentry from "@sentry/node";

export function setupSecurity(app: INestApplication): void {
  // Initialize Sentry if DSN is provided
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    });
  }

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Swagger
      crossOriginEmbedderPolicy: false,
    }),
  );
}
