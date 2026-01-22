import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual',
    example: 'CurrentPassword123!',
  })
  @IsString()
  @MinLength(6)
  passwordAntigua: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 6 caracteres, debe incluir letras, números y símbolos)',
    example: 'NewPassword123!',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&._-])[A-Za-z\d@$!%*#?&._-]{6,}$/, {
    message: 'La contraseña debe contener al menos una letra, un número y un símbolo (@$!%*#?&._-)',
  })
  nuevaPassword: string;

  @ApiProperty({
    description: 'Confirmación de nueva contraseña',
    example: 'NewPassword123!',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  confirmarPassword: string;
}
