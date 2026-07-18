import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  REDIS_URI: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string;

  @IsString()
  @IsOptional()
  CLIENT_URL: string;

  @IsNumber()
  @IsOptional()
  OTP_EXPIRY_SECONDS: number;

  @IsNumber()
  @IsOptional()
  RESET_TOKEN_EXPIRY_SECONDS: number;

  @IsString()
  @IsOptional()
  SMTP_HOST: string;

  @IsNumber()
  @IsOptional()
  SMTP_PORT: number;

  @IsString()
  @IsOptional()
  SMTP_USER: string;

  @IsString()
  @IsOptional()
  SMTP_PASS: string;

  @IsString()
  @IsOptional()
  SMTP_FROM: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Config validation error: ${errors.map(err => {
        return `\n - Property: "${err.property}" failed with constraint: ${JSON.stringify(err.constraints)}`;
      }).join('')}`
    );
  }
  return validatedConfig;
}
