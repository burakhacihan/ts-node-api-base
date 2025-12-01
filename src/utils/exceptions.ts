import { HttpStatusCode } from '@/core/constants/http-status';

export class HttpException extends Error {
  constructor(
    public status: number,
    public message: string,
  ) {
    super(message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(HttpStatusCode.UNAUTHORIZED, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(HttpStatusCode.FORBIDDEN, message);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request') {
    super(HttpStatusCode.BAD_REQUEST, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found') {
    super(HttpStatusCode.NOT_FOUND, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict') {
    super(HttpStatusCode.CONFLICT, message);
  }
}
