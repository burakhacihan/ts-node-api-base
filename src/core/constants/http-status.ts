/**
 * HTTP Status Codes
 *
 * This enum provides a centralized, type-safe way to manage HTTP status codes
 * throughout the application. It includes all commonly used status codes,
 * grouped by their category (Success, Client Error, Server Error).
 */

export enum HttpStatusCode {
  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  PARTIAL_CONTENT = 206,
  RESET_CONTENT = 205,

  // 3xx Redirection
  MOVED_PERMANENTLY = 301,

  // 4xx Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  GONE = 410,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * HTTP Status Messages
 *
 * Provides default messages for each status code.
 * These can be overridden when throwing exceptions or sending responses.
 */
export const HttpStatusMessage: Record<HttpStatusCode, string> = {
  [HttpStatusCode.OK]: 'OK',
  [HttpStatusCode.CREATED]: 'Created',
  [HttpStatusCode.ACCEPTED]: 'Accepted',
  [HttpStatusCode.NO_CONTENT]: 'No Content',
  [HttpStatusCode.PARTIAL_CONTENT]: 'Partial Content',
  [HttpStatusCode.RESET_CONTENT]: 'Reset Content',
  [HttpStatusCode.MOVED_PERMANENTLY]: 'Moved Permanently',
  [HttpStatusCode.BAD_REQUEST]: 'Bad Request',
  [HttpStatusCode.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatusCode.FORBIDDEN]: 'Forbidden',
  [HttpStatusCode.NOT_FOUND]: 'Not Found',
  [HttpStatusCode.CONFLICT]: 'Conflict',
  [HttpStatusCode.GONE]: 'Gone',
  [HttpStatusCode.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatusCode.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HttpStatusCode.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HttpStatusCode.BAD_GATEWAY]: 'Bad Gateway',
  [HttpStatusCode.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [HttpStatusCode.GATEWAY_TIMEOUT]: 'Gateway Timeout',
};

/**
 * Type guard to check if a number is a valid HTTP status code
 */
export function isValidHttpStatusCode(code: number): code is HttpStatusCode {
  return Object.values(HttpStatusCode).includes(code as HttpStatusCode);
}

/**
 * Helper function to get the default message for a status code
 */
export function getHttpStatusMessage(code: HttpStatusCode): string {
  return HttpStatusMessage[code];
}
