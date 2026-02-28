import { Router } from 'express';
const router = Router();

/** GET /v1/analytics/:userId/progress – detailed learning progress */
router.get('/:userId/progress', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 13' }); });

/** GET /v1/analytics/:userId/summary – high-level performance summary */
router.get('/:userId/summary', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 13' }); });

export { router as analyticsRouter };
