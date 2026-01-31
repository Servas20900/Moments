import { ApiPropertyOptional } from "@nestjs/swagger";
import { CategoriaImagen, EstadoActivo } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateImageDto {
  @ApiPropertyOptional({ enum: CategoriaImagen })
  @IsOptional()
  @IsEnum(CategoriaImagen)
  categoria?: CategoriaImagen;

  @ApiPropertyOptional({ example: "Texto alternativo accesible" })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ enum: EstadoActivo })
  @IsOptional()
  @IsEnum(EstadoActivo)
  estado?: EstadoActivo;
}
