import { Module } from '@nestjs/common'
import { ExtrasService } from './extras.service'
import { ExtrasController } from './extras.controller'
import { PrismaModule } from '../../common/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ExtrasController],
  providers: [ExtrasService],
  exports: [ExtrasService],
})
export class ExtrasModule {}
