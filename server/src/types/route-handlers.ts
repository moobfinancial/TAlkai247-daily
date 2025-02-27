import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export interface AssistantParams extends ParamsDictionary {
  id: string;
}

export type AsyncRouteHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
  res: Response<ResBody, Locals>
) => Promise<Response<ResBody, Locals> | void>;

export const wrapAsync = <P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>(
  fn: AsyncRouteHandler<P, ResBody, ReqBody, ReqQuery>
): ((req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: Function) => Promise<void>) => {
  return async (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: Function) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
};
