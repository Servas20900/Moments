import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  // app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Moments API')
    .setDescription('API for Moments - Premium travel experiences platform')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access_token',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Packages', 'Package management')
    .addTag('Vehicles', 'Vehicle management')
    .addTag('Reservations', 'Booking management')
    .addTag('Calendar', 'Calendar and availability')
    .addTag('Reviews', 'User reviews and ratings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Expose OpenAPI JSON for type generation
  app.getHttpAdapter().get('/api/docs-json', (req, res) => {
    res.json(document);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(` Server running on http://localhost:${port}`);
  console.log(` API Docs: http://localhost:${port}/api/docs`);
  console.log(` API endpoints available at /api/*`);
}

bootstrap().catch((error) => {
  console.error(' Bootstrap error:', error);
  process.exit(1);
});
