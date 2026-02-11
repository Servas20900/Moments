import { Module } from '@nestjs/common'
import { CategoriasIncluidosService } from './categorias-incluidos.service'
import { CategoriasIncluidosController } from './categorias-incluidos.controller'
import { PrismaModule } from '../../common/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [CategoriasIncluidosController],
  providers: [CategoriasIncluidosService],
  exports: [CategoriasIncluidosService],
})
export class CategoriasIncluidosModule {}
