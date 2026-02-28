import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  Max,
  validateSync,
} from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

/**
 * Strongly-typed environment variable class.
 * Validated at application startup — fails fast if any required var is missing.
 */
class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsInt()
  @IsPositive()
  PORT: number = 8001;

  @IsString()
  @IsNotEmpty()
  DB_HOST!: string;

  @IsInt()
  @IsPositive()
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string;

  @IsString()
  @IsNotEmpty()
  DB_USER!: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST!: string;

  @IsInt()
  @IsPositive()
  REDIS_PORT: number = 6379;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsInt()
  @IsPositive()
  REDIS_TTL_SECONDS: number = 900;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsString()
  @IsNotEmpty()
  JWT_ISSUER: string = 'ai-tutor-platform';

  @IsString()
  @IsNotEmpty()
  JWT_AUDIENCE: string = 'ai-tutor-clients';

  @IsInt()
  @Min(10)
  @Max(15)
  BCRYPT_ROUNDS: number = 12;

  @IsInt()
  @IsPositive()
  THROTTLE_TTL_SECONDS: number = 60;

  @IsInt()
  @IsPositive()
  THROTTLE_LIMIT: number = 20;

  @IsString()
  @IsNotEmpty()
  INTERNAL_SERVICE_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  AWS_REGION: string = 'us-east-1';

  @IsOptional()
  @IsString()
  SQS_EMAIL_QUEUE_URL?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const message = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n');
    throw new Error(`[auth-service] Environment validation failed:\n${message}`);
  }

  return validated;
}
