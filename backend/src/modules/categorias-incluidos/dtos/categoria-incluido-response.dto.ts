import { ApiProperty } from '@nestjs/swagger'
import { EstadoActivo } from '@prisma/client'

export class CategoriaIncluidoResponseDto {
  @ApiProperty({ description: 'ID de la categoría', example: 1 })
  id: number

  @ApiProperty({ description: 'Nombre de la categoría', example: 'LATAS' })
  nombre: string

  @ApiProperty({
    description: 'Estado de la categoría',
    enum: EstadoActivo,
    example: EstadoActivo.ACTIVO,
  })
  estado: EstadoActivo

  @ApiProperty({ description: 'Fecha de creación' })
  creadoEn: Date
}
