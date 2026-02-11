import { IsString, IsNotEmpty, IsOptional, IsInt, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateIncluidoDto {
  @ApiProperty({
    description: 'Nombre del incluido',
    example: 'Coca Cola',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string

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
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  categoriaId: number
}
