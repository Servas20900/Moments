import { IsString, IsNumber, IsInt, IsOptional, Min, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreatePackageDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  categoriaId: number;

  @ApiProperty({ example: "Paquete Romántico" })
  @IsString()
  nombre: string;

  @ApiProperty({ example: "Descripción del paquete" })
  @IsString()
  descripcion: string;

  @ApiProperty({ example: 150.0, type: Number })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioBase: number;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPersonas: number;

  @ApiProperty({ example: "https://res.cloudinary.com/...", required: false })
  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: "IDs de vehículos asociados al paquete",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleIds?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: "IDs de extras asociados al paquete",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraIds?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: "IDs de incluidos (bebidas) asociados al paquete",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  incluidoIds?: string[];

  @ApiProperty({
    example: ["Chofer profesional", "Botella de vino", "Decoración"],
    required: false,
    type: [String],
    description: "Lista de servicios y comodidades incluidas en el paquete",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  incluidos?: string[];
}
