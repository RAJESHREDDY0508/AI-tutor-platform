import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema, registerSchema, refreshTokenSchema } from '../services/auth.schema';

const router = Router();
const controller = new AuthController();

/**
 * POST /v1/auth/register
 * Public – create a new student account
 */
router.post('/register', validateRequest(registerSchema), controller.register);

/**
 * POST /v1/auth/login
 * Public – exchange credentials for access + refresh tokens
 */
router.post('/login', validateRequest(loginSchema), controller.login);

/**
 * POST /v1/auth/refresh
 * Public – exchange refresh token for new access token
 */
router.post('/refresh', validateRequest(refreshTokenSchema), controller.refresh);

/**
 * POST /v1/auth/logout
 * Protected – invalidate refresh token
 */
router.post('/logout', controller.logout);

export { router as authRouter };
