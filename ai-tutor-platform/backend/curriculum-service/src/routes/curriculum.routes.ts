import { Router } from 'express';
const router = Router();

/** POST /v1/curriculum/roadmap – generate a personalised curriculum roadmap */
router.post('/roadmap', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 10' }); });

/** GET /v1/curriculum/:userId – get curriculum for a student */
router.get('/:userId', (_req, res) => { res.status(501).json({ success: false, message: 'Not implemented – Sprint 10' }); });

export { router as curriculumRouter };
