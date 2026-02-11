import { INestApplication } from "@nestjs/common";

export function setupCors(app: INestApplication): void {
  // Enable CORS - Permissive in development, strict in production
  const isDevelopment = process.env.NODE_ENV !== "production";
  const allowedOrigins = isDevelopment
    ? ["*"]
    : (process.env.FRONTEND_URL || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes("*") || !origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}
