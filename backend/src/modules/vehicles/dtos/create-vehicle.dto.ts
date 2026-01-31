import { IsString, IsInt, IsNumber, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateVehicleDto {
  @ApiProperty({ example: "Toyota Hiace" })
  @IsString()
  nombre: string;

  @ApiProperty({ example: "Van" })
  @IsString()
  categoria: string;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  asientos: number;

  @ApiProperty({ example: 25.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tarifaPorHora: number;

  @ApiProperty({ example: "https://res.cloudinary.com/...", required: false })
  @IsOptional()
  @IsString()
  imagenUrl?: string;
}
