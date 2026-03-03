import { IsString, IsInt, IsNumber, IsOptional, Min, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateVehicleDto {
  @ApiProperty({ example: "Toyota Hiace" })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 1, description: "ID de la categoría de vehículo" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoriaId: number;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  asientos: number;

  @ApiProperty({ example: 1, description: "Cantidad de unidades disponibles del mismo vehículo", default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  cantidad?: number;

  @ApiProperty({ example: 25.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tarifaPorHora: number;

  @ApiProperty({ example: "https://res.cloudinary.com/...", required: false })
  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @ApiProperty({
    example: ["Aire acondicionado", "WiFi", "Mini bar"],
    required: false,
    type: [String],
    description: "Lista de características del vehículo",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  caracteristicas?: string[];
}
