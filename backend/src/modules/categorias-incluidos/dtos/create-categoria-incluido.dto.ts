import { IsString, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCategoriaIncluidoDto {
  @ApiProperty({
    description: 'Nombre de la categoría de incluido',
    example: 'LATAS',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string
}
