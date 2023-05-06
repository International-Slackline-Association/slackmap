import { Request, Response } from 'express';
import { z, ZodError, ZodType, ZodTypeAny } from 'zod';

export const catchExpressJsErrorWrapper = (
  f: (req: Request<any, any, any, any>, res: Response, next?: any) => Promise<any>,
) => {
  return (req: Request, res: Response, next: any) => {
    f(req, res, next).catch(next);
  };
};

export const validateApiPayload = <T extends ZodTypeAny>(payload: unknown, schema: T): z.infer<T> => {
  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Validation: ${error.issues[0].path?.[0]}: ${error.issues[0].message}.`);
    }
    throw error;
  }
};

export const verifyRequestClaims = (req: Request) => {
  if (!req.user) {
    throw new Error('Unauthorized: Missing claims');
  }
  if (!req.user.isaId) {
    throw new Error('Unauthorized: Missing sub claim');
  }
  return req.user as { isaId: string; sub: string; email?: string };
};

export const destructPaginationQueryParam = (params: { cursor?: string; limit?: number }) => {
  let cursor: any = undefined;
  try {
    cursor = params.cursor ? JSON.parse(Buffer.from(params.cursor, 'base64').toString('utf8')) : undefined;
  } catch (error) {
    //
  }

  const limit = params.limit;
  return { cursor, limit };
};

export const constructPaginationResponse = (cursorObject: any) => {
  const cursor = cursorObject ? Buffer.from(JSON.stringify(cursorObject), 'utf8').toString('base64') : undefined;
  return { cursor };
};
