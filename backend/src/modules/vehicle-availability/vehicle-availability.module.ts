import { Module } from '@nestjs/common';
import { VehicleAvailabilityController } from './vehicle-availability.controller';
import { VehicleAvailabilityService } from './vehicle-availability.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleAvailabilityController],
  providers: [VehicleAvailabilityService],
  exports: [VehicleAvailabilityService],
})
export class VehicleAvailabilityModule {}
