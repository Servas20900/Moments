import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from "class-validator";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

/**
 * Schema de validación para variables de entorno
 * Asegura que todas las variables críticas estén configuradas correctamente
 */
export class EnvironmentVariables {
  // Entorno
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment = Environment.Development;

  // Servidor
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  // Base de datos
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  // JWT - CRÍTICO: No permitir valores por defecto
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string = "7d";

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRATION: string = "30d";

  // Frontend
  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_URL?: string;

  // Cloudinary - Requerido para producción
  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  // File upload
  @IsString()
  @IsOptional()
  FILE_UPLOAD_PATH: string = "./uploads";

  @IsNumber()
  @IsOptional()
  MAX_FILE_SIZE: number = 5242880; // 5MB

  // Email (opcional)
  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsNumber()
  @IsOptional()
  SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  // Admin seed (para producción usar valor seguro)
  @IsString()
  @IsOptional()
  ADMIN_DEFAULT_PASSWORD?: string;

  // Sentry
  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;

  @IsNumber()
  @IsOptional()
  SENTRY_TRACES_SAMPLE_RATE?: number;
}

/**
 * Función de validación para ConfigModule
 * Valida y transforma las variables de entorno al inicio de la aplicación
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  const extraErrors: string[] = [];
  if (validatedConfig.NODE_ENV === Environment.Production) {
    const hasCloudinary =
      !!validatedConfig.CLOUDINARY_CLOUD_NAME &&
      !!validatedConfig.CLOUDINARY_API_KEY &&
      !!validatedConfig.CLOUDINARY_API_SECRET;

    if (!hasCloudinary) {
      extraErrors.push(
        "CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET son requeridos en production",
      );
    }

  }

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = Object.values(error.constraints || {});
      return `  • ${error.property}: ${constraints.join(", ")}`;
    });

    extraErrors.forEach((msg) => errorMessages.push(`  • ${msg}`));

    throw new Error(
      `❌ CONFIGURACIÓN INVÁLIDA - Variables de entorno:\n${errorMessages.join("\n")}\n\n` +
        `🔧 Verifica tu archivo .env y asegúrate de tener todas las variables requeridas.\n` +
        `📝 Consulta .env.example para ver un ejemplo de configuración.`,
    );
  }

  if (extraErrors.length > 0) {
    throw new Error(
      `❌ CONFIGURACIÓN INVÁLIDA - Variables de entorno:\n  • ${extraErrors.join(", ")}\n\n` +
        `🔧 Verifica tu archivo .env y asegúrate de tener todas las variables requeridas para production.\n` +
        `📝 Consulta .env.example para ver un ejemplo de configuración.`,
    );
  }

  return validatedConfig;
}
