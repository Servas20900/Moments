import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { TerminusModule } from "@nestjs/terminus";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { PrismaModule } from "./common/prisma/prisma.module";
import { LoggerModule } from "./common/logger/logger.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { PackagesModule } from "./modules/packages/packages.module";
import { VehiclesModule } from "./modules/vehicles/vehicles.module";
import { ExperiencesModule } from "./modules/experiences/experiences.module";
import { ReservationsModule } from "./modules/reservations/reservations.module";
import { CalendarModule } from "./modules/calendar/calendar.module";
import { ImagesModule } from "./modules/images/images.module";
import { ExtrasModule } from "./modules/extras/extras.module";
import { HealthController } from "./common/health/health.controller";
import { StaticController } from "./common/static/static.controller";
import { validate } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60_000, // 60s caching window for hot endpoints
      max: 100,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "..", "public"),
      serveRoot: "/",
      exclude: ["/api*", "/auth*", "/usuarios*", "/paquetes*", "/vehiculos*", "/experiencias*", "/reservas*", "/eventos*", "/imagenes*", "/extras*", "/health*"],
      serveStaticOptions: {
        index: ["index.html"],
        fallthrough: false,
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60000, // 60 segundos
        limit: 100, // 100 requests por minuto
      },
      {
        name: "strict",
        ttl: 60000, // 60 segundos
        limit: 10, // 10 requests por minuto para auth
      },
    ]),
    TerminusModule,
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    PackagesModule,
    VehiclesModule,
    ExperiencesModule,
    ReservationsModule,
    CalendarModule,
    ImagesModule,
    ExtrasModule,
  ],
  controllers: [HealthController, StaticController],
})
export class AppModule {}
