import { Request, Response, NextFunction } from 'express';
import { User } from './prisma';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface TypedRequest<T = any> extends Request {
  body: T;
}

export interface TypedResponse<T = any> extends Response {
  json: (body: T) => TypedResponse<T>;
}

export type RequestHandler<T = any, U = any> = (
  req: TypedRequest<T>,
  res: TypedResponse<U>,
  next: NextFunction
) => Promise<void | Response> | void | Response;

export type ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => Response | void;
