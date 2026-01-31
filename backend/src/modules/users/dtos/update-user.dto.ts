import { IsOptional, IsString, IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  identificacion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  distritoId?: number;
}
