import "express";

declare global {
  namespace Express {
    interface Request {
      loginInfo: {
        userId: number;
        email: string;
        name: string;
      };
    }
  }
}
