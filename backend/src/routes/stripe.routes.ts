import { Router } from 'express';
import { stripeController } from '../controllers/stripe.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';

const router = Router();

// Validation middleware
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create checkout session
router.post(
  '/create-checkout-session',
  authenticate,
  [
    body('priceId').notEmpty().withMessage('Price ID is required'),
    body('successUrl').isURL().withMessage('Success URL must be valid'),
    body('cancelUrl').isURL().withMessage('Cancel URL must be valid'),
  ],
  validateRequest,
  stripeController.createCheckoutSession
);

// Create customer portal session
router.post(
  '/create-portal-session',
  authenticate,
  [
    body('returnUrl').optional().isURL().withMessage('Return URL must be valid'),
  ],
  validateRequest,
  stripeController.createPortalSession
);

// Get subscription status
router.get(
  '/subscription-status',
  authenticate,
  stripeController.getSubscriptionStatus
);

// Webhook endpoint (no authentication, Stripe verifies with signature)
// IMPORTANT: This needs raw body, not parsed JSON
router.post(
  '/webhook',
  stripeController.handleWebhook
);

export default router;