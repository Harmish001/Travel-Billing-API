import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import AuthController from '../controllers/auth.controller';

const router = Router();

router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));
router.get('/me', requireAuth as any, (req: any, res: any) => AuthController.getProfile(req, res));
router.post('/logout', requireAuth as any, (req: any, res: any) => AuthController.logout(req, res));
router.post('/forgot-password', AuthController.forgotPassword.bind(AuthController));
router.post('/reset-password', AuthController.resetPassword.bind(AuthController));

export default router;
