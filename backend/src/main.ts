import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import compression from "compression";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import * as Sentry from "@sentry/node";
import { join } from "path";
import type { Request, Response, NextFunction } from "express";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { AppModule } from "./app.module";

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    });
  }

  const app = await NestFactory.create(AppModule);

  // Configurar Winston como logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security headers con Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Deshabilitado para Swagger
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Compresión de respuestas
  app.use(compression());

  // SPA fallback middleware - sirve index.html para rutas que no existen y no son APIs
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Si ya fue manejado por un controller (tiene status != undefined), seguir
    if (res.statusCode !== 404) {
      return next();
    }
    
    // Si es una ruta API, no interceptar
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || 
        req.path.startsWith('/usuarios') || req.path.startsWith('/paquetes') ||
        req.path.startsWith('/vehiculos') || req.path.startsWith('/experiencias') ||
        req.path.startsWith('/reservas') || req.path.startsWith('/eventos') ||
        req.path.startsWith('/imagenes') || req.path.startsWith('/extras') ||
        req.path.startsWith('/health') || req.path.startsWith('/assets')) {
      return next();
    }

    // Si tiene extensión de archivo, no interceptar
    if (req.path.includes('.')) {
      return next();
    }

    // Sirve index.html para SPA routing
    res.sendFile(join(process.cwd(), "..", "public", "index.html"));
  });

  // Set global prefix
  // app.setGlobalPrefix('api');

  // Enable CORS - Estricto en producción
  const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Cambiado a false para permitir campos extras y evitar errores
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filters - orden específico: más específico a más general
  app.useGlobalFilters(
    new HttpExceptionFilter(),      // Maneja HttpException
    new PrismaExceptionFilter(),    // Maneja errores de Prisma/DB
    new AllExceptionsFilter(),      // Catch-all + Sentry
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle("Moments API")
    .setDescription("API for Moments - Premium travel experiences platform")
    .setVersion("1.0.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access_token",
    )
    .addTag("Auth", "Authentication endpoints")
    .addTag("Users", "User management")
    .addTag("Packages", "Package management")
    .addTag("Vehicles", "Vehicle management")
    .addTag("Reservations", "Booking management")
    .addTag("Calendar", "Calendar and availability")
    .addTag("Reviews", "User reviews and ratings")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Expose OpenAPI JSON for type generation
  app.getHttpAdapter().get("/api/docs-json", (req, res) => {
    res.json(document);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(` Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(` API Documentation: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error(" Bootstrap error:", error);
  process.exit(1);
});
