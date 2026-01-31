import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Password123!",
    description:
      "Contraseña (mínimo 6 caracteres, debe incluir letras, números y símbolos)",
  })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&._-])[A-Za-z\d@$!%*#?&._-]{6,}$/,
    {
      message:
        "La contraseña debe contener al menos una letra, un número y un símbolo (@$!%*#?&._-)",
    },
  )
  contrasena: string;

  @ApiProperty({ example: "Juan Pérez" })
  @IsString()
  nombre: string;

  @ApiProperty({ example: "88888888", required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ example: "123456789", required: false })
  @IsOptional()
  @IsString()
  identificacion?: string;

  @ApiProperty({
    example: 1,
    description: "ID del distrito de residencia",
    required: false,
  })
  @IsOptional()
  @IsInt()
  distritoId?: number;
}
