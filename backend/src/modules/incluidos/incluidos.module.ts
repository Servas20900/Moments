import { Module } from '@nestjs/common'
import { IncluidosService } from './incluidos.service'
import { IncluidosController } from './incluidos.controller'
import { PrismaModule } from '../../common/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [IncluidosController],
  providers: [IncluidosService],
  exports: [IncluidosService],
})
export class IncluidosModule {}
