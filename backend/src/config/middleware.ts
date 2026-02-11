import { INestApplication } from "@nestjs/common";
import compression from "compression";
import type { Request, Response, NextFunction } from "express";
import { join } from "path";

export function setupMiddleware(app: INestApplication): void {
  // Response compression
  app.use(compression());

  // SPA fallback middleware - serves index.html for routes that don't exist and aren't APIs
  app.use((req: Request, res: Response, next: NextFunction) => {
    // If it's an API or health route, don't intercept
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/auth") ||
      req.path.startsWith("/paquetes") ||
      req.path.startsWith("/vehiculos") ||
      req.path.startsWith("/vehicle-availability") ||
      req.path.startsWith("/eventos") ||
      req.path.startsWith("/experiencias") ||
      req.path.startsWith("/reservas") ||
      req.path.startsWith("/imagenes") ||
      req.path.startsWith("/extras") ||
      req.path.startsWith("/categorias-incluidos") ||
      req.path.startsWith("/incluidos") ||
      req.path.startsWith("/usuarios") ||
      req.path.startsWith("/calendario") ||
      req.path.startsWith("/health")
    ) {
      return next();
    }

    // If it has file extension, don't intercept (it's a static file)
    if (req.path.includes(".")) {
      return next();
    }

    // Serve index.html for SPA routing
    const staticDir = process.env.NODE_ENV === "production" ? "public" : "web/dist";
    res.sendFile(join(process.cwd(), "..", staticDir, "index.html"));
  });
}
