import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { EmailModule } from "../../common/email/email.module";
import { InvoiceModule } from "../../common/invoice/invoice.module";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";

@Module({
  imports: [PrismaModule, EmailModule, InvoiceModule, NotificacionesModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
