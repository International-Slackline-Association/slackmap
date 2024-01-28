import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny, z } from 'zod';

export const expressRoute = (
  f: (req: Request<any, any, any, any>, res: Response, next?: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: any) => {
    f(req, res, next)
      .then((result) => {
        if (typeof result === 'object') {
          res.json(result);
        }
      })
      .catch(next);
  };
};

export const validateApiPayload = <T extends ZodTypeAny>(
  payload: unknown,
  schema: T,
): z.infer<T> => {
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
    cursor = params.cursor
      ? JSON.parse(Buffer.from(params.cursor, 'base64').toString('utf8'))
      : undefined;
  } catch (error) {
    //
  }

  const limit = params.limit;
  return { cursor, limit };
};

export const constructPaginationResponse = (cursorObject: any) => {
  const cursor = cursorObject
    ? Buffer.from(JSON.stringify(cursorObject), 'utf8').toString('base64')
    : undefined;
  return { cursor };
};

export const s3ImageUploadZodSchema = z
  .object({
    id: z.string(),
    isInProcessingBucket: z.boolean().optional(),
    s3Key: z.string(),
    isCover: z.boolean().optional(),
  })
  .array()
  .optional();
