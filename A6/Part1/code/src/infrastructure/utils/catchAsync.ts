import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an asynchronous controller function and catches any errors,
 * passing them to the next middleware (global error handler).
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
