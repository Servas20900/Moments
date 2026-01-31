import { ApiPropertyOptional } from "@nestjs/swagger";
import { CategoriaImagen, EstadoActivo } from "@prisma/client";
import { IsEnum, IsOptional, IsString, IsBoolean, IsNumber, IsUrl } from "class-validator";

export class UpdateImageDto {
  @ApiPropertyOptional({ enum: CategoriaImagen })
  @IsOptional()
  @IsEnum(CategoriaImagen)
  categoria?: CategoriaImagen;

  @ApiPropertyOptional({ example: "https://res.cloudinary.com/..." })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ example: "Texto alternativo accesible" })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ example: "Subtítulo" })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ example: "Descripción" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: EstadoActivo })
  @IsOptional()
  @IsEnum(EstadoActivo)
  estado?: EstadoActivo;
}
