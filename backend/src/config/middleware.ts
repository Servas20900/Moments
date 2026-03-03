import { INestApplication } from "@nestjs/common";
import compression from "compression";
import type { Request, Response, NextFunction } from "express";
import { resolveStaticIndexFile } from "./static-assets";

export function setupMiddleware(app: INestApplication): void {
  // Response compression
  app.use(compression());

  const staticIndexFile = resolveStaticIndexFile();

  // SPA fallback middleware - serves index.html for routes that don't exist and aren't APIs
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Only handle browser navigations
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

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
      req.path.startsWith("/notificaciones") ||
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

    // If frontend assets are not bundled in this container, don't intercept
    if (!staticIndexFile) {
      return next();
    }

    // Only respond with SPA shell when client expects HTML
    const acceptsHeader = req.headers.accept ?? "";
    if (!acceptsHeader.includes("text/html")) {
      return next();
    }

    // Serve index.html for SPA routing
    res.sendFile(staticIndexFile);
  });
}
