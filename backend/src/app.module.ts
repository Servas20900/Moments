import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PackagesModule } from './modules/packages/packages.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ExperiencesModule } from './modules/experiences/experiences.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ImagesModule } from './modules/images/images.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthController } from './common/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PackagesModule,
    VehiclesModule,
    ExperiencesModule,
    ReservationsModule,
    CalendarModule,
    ReviewsModule,
    ImagesModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
