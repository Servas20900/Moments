import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CategoriaImagen } from "@prisma/client";
import { IsEnum, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateImageDto {
  @ApiProperty({ enum: CategoriaImagen })
  @IsEnum(CategoriaImagen)
  categoria: CategoriaImagen;

  @ApiProperty({
    example: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  })
  @IsString()
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: "Hero principal" })
  @IsOptional()
  @IsString()
  altText?: string;
}
