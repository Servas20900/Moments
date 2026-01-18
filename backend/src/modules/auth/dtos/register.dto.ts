import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '88888888', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  identificacion?: string;

  @ApiProperty({ example: 1, description: 'ID del distrito de residencia', required: false })
  @IsOptional()
  @IsInt()
  distritoId?: number;
}
