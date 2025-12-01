import { Request, Response, NextFunction } from 'express';
import { apiConfig } from '../config/api';
import { HttpException } from '../utils/exceptions';
import { HttpStatusCode } from '@/core/constants/http-status';

export const apiVersionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!apiConfig.enabled) {
    return next();
  }

  // Extract version from URL path
  const versionMatch = req.path.match(/^\/api\/(v\d+)\//);
  const version = versionMatch ? versionMatch[1] : apiConfig.defaultVersion;

  // Check if version is supported
  if (!apiConfig.supportedVersions.includes(version)) {
    throw new HttpException(HttpStatusCode.BAD_REQUEST, `Unsupported API version: ${version}`);
  }

  // Add version to request for use in routes
  req.apiVersion = version;
  next();
};
