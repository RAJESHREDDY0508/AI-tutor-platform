import { Router } from 'express';
const router = Router();

/** POST /v1/payments/subscribe – create or update a subscription */
router.post('/subscribe', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 14' }); });

/** POST /v1/payments/webhook – receive Stripe/payment-provider webhook events */
router.post('/webhook', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 14' }); });

/** GET /v1/payments/subscription/:userId – get active subscription for a user */
router.get('/subscription/:userId', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 14' }); });

export { router as paymentRouter };
