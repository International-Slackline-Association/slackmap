import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        isaId?: string;
        sub?: string;
        email?: string;
      };
    }
  }
}
