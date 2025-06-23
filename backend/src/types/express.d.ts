import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
        stripeCustomerId?: string;
        subscriptionId?: string;
        subscriptionStatus?: string;
      };
    }
  }
}

export {};