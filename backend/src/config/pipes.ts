import { INestApplication, ValidationPipe } from "@nestjs/common";

export function setupPipes(app: INestApplication): void {
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Changed to false to allow extra fields and avoid errors
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}
