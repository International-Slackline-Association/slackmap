import 'express';

declare global {
  namespace Express {
    interface Request {
      claims: {
        sub: string;
      };
      user: {
        isaId: string;
      };
    }
  }
}
