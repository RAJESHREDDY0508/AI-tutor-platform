import { Router } from 'express';
const router = Router();

/** POST /v1/sessions – start a new AI teaching session */
router.post('/', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 6' }); });

/** GET /v1/sessions/:id – get session details */
router.get('/:id', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 6' }); });

/** PATCH /v1/sessions/:id/end – end an active session */
router.patch('/:id/end', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 6' }); });

export { router as sessionRouter };
