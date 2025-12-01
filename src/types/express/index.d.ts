export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      apiVersion?: string;
    }
  }
}
