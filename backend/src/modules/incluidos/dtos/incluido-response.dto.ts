import { ApiProperty } from '@nestjs/swagger'
import { EstadoActivo } from '@prisma/client'

export class IncluidoResponseDto {
  @ApiProperty({ description: 'ID del incluido', example: 'clxxx...' })
  id: string

  @ApiProperty({ description: 'Nombre del incluido', example: 'Coca Cola' })
  nombre: string

  @ApiProperty({ description: 'Descripción del incluido', example: 'Lata de 355ml', nullable: true })
  descripcion: string | null

  @ApiProperty({ description: 'ID de la categoría', example: 1 })
  categoriaId: number

  @ApiProperty({ description: 'Nombre de la categoría', example: 'LATAS' })
  categoriaNombre: string

  @ApiProperty({
    description: 'Estado del incluido',
    enum: EstadoActivo,
    example: EstadoActivo.ACTIVO,
  })
  estado: EstadoActivo

  @ApiProperty({ description: 'Fecha de creación' })
  creadoEn: Date

  @ApiProperty({ description: 'Fecha de última actualización' })
  actualizadoEn: Date

  @ApiProperty({ description: 'IDs de paquetes asociados', type: [String], required: false })
  packageIds?: string[]
}
