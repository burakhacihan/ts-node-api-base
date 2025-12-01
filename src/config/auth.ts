// RegistrationMode enum and config for registration settings

export enum RegistrationMode {
  PUBLIC = 'public',
  INVITATION = 'invitation',
  DOMAIN_WHITELIST = 'domainwhitelist',
  CLOSED = 'closed',
}

/**
 * Parse JWT expiresIn value with proper type safety
 * Supports both numeric values (seconds) and time strings (e.g., "15m", "1h", "7d")
 */
const parseExpiresIn = (value: string | undefined, defaultValue: string): string | number => {
  if (!value) {
    return defaultValue;
  }

  // If it's a pure number, treat as seconds
  if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  }

  // If it contains time units (s, m, h, d), keep as string
  if (/^\d+[smhd]$/.test(value)) {
    return value;
  }

  // If it's a valid time string with space (e.g., "15 minutes", "1 hour")
  if (/^\d+\s+(second|minute|hour|day|week|month|year)s?$/i.test(value)) {
    return value;
  }

  // Default fallback
  return defaultValue;
};

// JWT Configuration
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: parseExpiresIn(
    process.env.JWT_ACCESS_TOKEN_EXPIRY || process.env.JWT_EXPIRES_IN,
    '15m',
  ),
  refreshTokenExpiry: parseExpiresIn(process.env.JWT_REFRESH_TOKEN_EXPIRY, '7d'),
};

// Registration Configuration
export const registrationMode: RegistrationMode =
  (process.env.REGISTRATION_MODE as RegistrationMode) || RegistrationMode.PUBLIC;

export const allowedDomains: string[] = process.env.ALLOWED_DOMAINS
  ? process.env.ALLOWED_DOMAINS.split(',').map((d) => d.trim().toLowerCase())
  : [];

// Admin Bootstrap Configuration
export const adminConfig = {
  email: process.env.DEFAULT_ADMIN_EMAIL,
  password: process.env.DEFAULT_ADMIN_PASSWORD,
};
