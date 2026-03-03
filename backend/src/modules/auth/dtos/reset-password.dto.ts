import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({
    example: "9f6ef1f1b1d743e58b90dc1faaf4d0b8f95f624f08fa66e1f6f4251c14f73f41",
    description: "Token de recuperación enviado por correo",
  })
  @IsString({ message: "El token debe ser texto" })
  @IsNotEmpty({ message: "El token es requerido" })
  token: string;

  @ApiProperty({
    example: "Password123!",
    description:
      "Contraseña (mínimo 6 caracteres, debe incluir letras, números y símbolos)",
  })
  @IsString({ message: "La contraseña debe ser texto" })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&._-])[A-Za-z\d@$!%*#?&._-]{6,}$/,
    {
      message:
        "La contraseña debe contener al menos una letra, un número y un símbolo (@$!%*#?&._-)",
    },
  )
  nuevaPassword: string;

  @ApiProperty({
    example: "Password123!",
    description: "Confirmación de la nueva contraseña",
  })
  @IsString({ message: "La confirmación de contraseña debe ser texto" })
  @IsNotEmpty({ message: "La confirmación de contraseña es requerida" })
  confirmarPassword: string;
}
