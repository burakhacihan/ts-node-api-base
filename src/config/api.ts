export interface ApiVersionConfig {
  enabled: boolean;
  defaultVersion: string;
  supportedVersions: string[];
}

export const apiConfig: ApiVersionConfig = {
  enabled: process.env.API_VERSIONING_ENABLED === 'true',
  defaultVersion: process.env.API_DEFAULT_VERSION || 'v1',
  supportedVersions: (process.env.API_SUPPORTED_VERSIONS || 'v1').split(','),
};

// CORS Configuration
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: (process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE').split(','),
  allowedHeaders: (process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization').split(','),
};
