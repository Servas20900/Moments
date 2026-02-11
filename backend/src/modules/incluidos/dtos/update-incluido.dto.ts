import { IsString, IsOptional, IsInt, IsEnum, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { EstadoActivo } from '@prisma/client'

export class UpdateIncluidoDto {
  @ApiProperty({
    description: 'Nombre del incluido',
    example: 'Sprite',
    maxLength: 200,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombre?: string

  @ApiProperty({
    description: 'Descripción del incluido',
    example: 'Lata de 355ml',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string

  @ApiProperty({
    description: 'ID de la categoría del incluido',
    example: 2,
    required: false,
  })
  @IsInt()
  @IsOptional()
  categoriaId?: number

  @ApiProperty({
    description: 'Estado del incluido',
    enum: EstadoActivo,
    required: false,
  })
  @IsEnum(EstadoActivo)
  @IsOptional()
  estado?: EstadoActivo
}
