import { INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication): void {
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
}
