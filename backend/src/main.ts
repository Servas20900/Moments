import { NestFactory } from "@nestjs/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { setupSecurity } from "./config/security";
import { setupCors } from "./config/cors";
import { setupMiddleware } from "./config/middleware";
import { setupPipes } from "./config/pipes";
import { setupFilters } from "./config/filters";
import { setupSwagger } from "./config/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapter = app.getHttpAdapter();
  const httpServer = httpAdapter.getInstance();
  if (httpServer?.set) {
    httpServer.set("trust proxy", 1);
  }

  // Configure Winston as logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Setup all configurations
  setupSecurity(app);
  setupCors(app);
  setupMiddleware(app);
  setupPipes(app);
  setupFilters(app);
  
  // Only enable Swagger in development
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`Application is running on: http://localhost:${port}`, "Bootstrap");
  logger.log(`API Documentation: http://localhost:${port}/api/docs`, "Bootstrap");
}

bootstrap().catch((error) => {
  console.error("Bootstrap error:", error);
  process.exit(1);
});
