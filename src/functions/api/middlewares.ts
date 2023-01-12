import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { logger } from 'core/utils/logger';
import jwt_decode from 'jwt-decode';
import { parseExpectedError } from 'core/utils/error';
import { getCurrentInvoke } from '@vendia/serverless-express';

export const injectCommonlyUsedHeadersMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = (req.header('Authorization') || req.header('authorization')) as string;
  if (authHeader) {
    const claims: any = jwt_decode(authHeader.split(' ')[1]) as { [key: string]: string };
    req.claims = claims;
  }

  next();
};

export const errorMiddleware: ErrorRequestHandler = async (error, req, res, next) => {
  if (!error) {
    next();
    return;
  }
  const { status, code, errorMessage, isExpectedError } = parseExpectedError(error);
  const message = errorMessage || 'Error occurred';
  const stack = error.stack;

  const loggerData = {
    httpRequest: { path: req.path, body: req.body, method: req.method },
    status,
    stack,
  };
  if (isExpectedError) {
    logger.warn(message, loggerData);
  } else {
    logger.error(message, loggerData);
  }

  res.status(status).json({
    status: 500,
    message,
    code,
    stack,
  });
};

export const notFoundMiddleware = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ message: '404 Not Found' });
};
