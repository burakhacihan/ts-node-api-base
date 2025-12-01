interface EnvValidationRule {
  key: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
  defaultValue?: any;
  validator?: (value: any) => boolean;
  message?: string;
}

export class EnvironmentValidator {
  private static readonly validationRules: EnvValidationRule[] = [
    {
      key: 'JWT_SECRET',
      required: true,
      type: 'string',
      validator: (value) => value.length >= 32,
      message: 'JWT_SECRET must be at least 32 characters long',
    },
    {
      key: 'JWT_ACCESS_TOKEN_EXPIRY',
      required: false,
      type: 'string',
      defaultValue: '15m',
      validator: (value) =>
        /^\d+[smhd]?$/.test(value) ||
        /^\d+\s+(second|minute|hour|day|week|month|year)s?$/i.test(value),
      message:
        'JWT_ACCESS_TOKEN_EXPIRY must be a valid time format (e.g., "15m", "1h", "7d", "15 minutes")',
    },
    {
      key: 'JWT_REFRESH_TOKEN_EXPIRY',
      required: false,
      type: 'string',
      defaultValue: '7d',
      validator: (value) =>
        /^\d+[smhd]?$/.test(value) ||
        /^\d+\s+(second|minute|hour|day|week|month|year)s?$/i.test(value),
      message:
        'JWT_REFRESH_TOKEN_EXPIRY must be a valid time format (e.g., "15m", "1h", "7d", "15 minutes")',
    },
    {
      key: 'JWT_EXPIRES_IN',
      required: false,
      type: 'string',
      defaultValue: '15m',
      validator: (value) =>
        /^\d+[smhd]?$/.test(value) ||
        /^\d+\s+(second|minute|hour|day|week|month|year)s?$/i.test(value),
      message: 'JWT_EXPIRES_IN must be a valid time format (e.g., "15m", "1h", "7d", "15 minutes")',
    },
    {
      key: 'NODE_ENV',
      required: false,
      type: 'string',
      defaultValue: 'development',
      validator: (value) => ['development', 'production', 'test', 'staging'].includes(value),
      message: 'NODE_ENV must be one of: development, production, test, staging',
    },
    {
      key: 'PORT',
      required: false,
      type: 'number',
      defaultValue: 3000,
      validator: (value) => value >= 1 && value <= 65535,
      message: 'PORT must be between 1 and 65535',
    },
    {
      key: 'DB_HOST',
      required: false,
      type: 'string',
      defaultValue: 'localhost',
    },
    {
      key: 'DB_PORT',
      required: false,
      type: 'number',
      defaultValue: 5432,
      validator: (value) => value >= 1 && value <= 65535,
      message: 'DB_PORT must be between 1 and 65535',
    },
    {
      key: 'DB_USERNAME',
      required: false,
      type: 'string',
      defaultValue: 'postgres',
    },
    {
      key: 'DB_PASSWORD',
      required: false,
      type: 'string',
      defaultValue: 'postgres',
    },
    {
      key: 'DB_NAME',
      required: false,
      type: 'string',
      defaultValue: 'tsnodebaseapi',
    },
    {
      key: 'REDIS_HOST',
      required: false,
      type: 'string',
      defaultValue: 'localhost',
    },
    {
      key: 'REDIS_PORT',
      required: false,
      type: 'number',
      defaultValue: 6379,
      validator: (value) => value >= 1 && value <= 65535,
      message: 'REDIS_PORT must be between 1 and 65535',
    },
  ];

  static validate(): void {
    const errors: string[] = [];

    for (const rule of this.validationRules) {
      const value = process.env[rule.key];

      // Check if required variable is missing
      if (rule.required && !value) {
        errors.push(`Required environment variable ${rule.key} is missing`);
        continue;
      }

      // If value is missing and not required, use default
      if (!value && rule.defaultValue !== undefined) {
        process.env[rule.key] = rule.defaultValue.toString();
        continue;
      }

      // Type validation
      if (value) {
        const typedValue = this.parseValue(value, rule.type);
        if (typedValue === null) {
          errors.push(`Environment variable ${rule.key} must be of type ${rule.type}`);
          continue;
        }

        // Custom validation
        if (rule.validator && !rule.validator(typedValue)) {
          errors.push(rule.message || `Environment variable ${rule.key} failed validation`);
          continue;
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }
  }

  private static parseValue(value: string, type: 'string' | 'number' | 'boolean'): any {
    switch (type) {
      case 'string':
        return value;
      case 'number':
        const num = parseInt(value, 10);
        return isNaN(num) ? null : num;
      case 'boolean':
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        return null;
      default:
        return null;
    }
  }

  static getRequiredVariables(): string[] {
    return this.validationRules.filter((rule) => rule.required).map((rule) => rule.key);
  }

  static getMissingVariables(): string[] {
    return this.validationRules
      .filter((rule) => rule.required && !process.env[rule.key])
      .map((rule) => rule.key);
  }
}
