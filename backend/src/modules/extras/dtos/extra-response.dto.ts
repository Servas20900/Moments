import { ApiProperty } from '@nestjs/swagger'
import { CategoriaExtra, EstadoActivo } from '@prisma/client'

export class ExtraResponseDto {
  @ApiProperty({
    description: 'ID único del extra',
    example: 'clm1234abcd',
  })
  id: string

  @ApiProperty({
    description: 'Nombre del extra',
    example: 'Champagne Premium',
  })
  nombre: string

  @ApiProperty({
    description: 'Descripción del extra',
    example: 'Botella de Champagne Veuve Clicquot',
  })
  descripcion: string | null

  @ApiProperty({
    description: 'Precio del extra en dólares',
    example: 45.5,
  })
  precio: number

  @ApiProperty({
    description: 'Categoría del extra',
    enum: ['SIN_ALCOHOL', 'PREMIUM_ALCOHOL'],
  })
  categoria: CategoriaExtra

  @ApiProperty({
    description: 'Estado del extra',
    enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'],
  })
  estado: EstadoActivo

  @ApiProperty({
    description: 'Fecha de creación',
  })
  creadoEn: Date

  @ApiProperty({
    description: 'Fecha de última actualización',
  })
  actualizadoEn: Date
}
