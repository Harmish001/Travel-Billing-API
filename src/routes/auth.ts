import { Router, RequestHandler } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  register,
  login,
  getProfile,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.get('/me', requireAuth as RequestHandler, getProfile as RequestHandler);
router.post('/logout', requireAuth as RequestHandler, logout as RequestHandler);
router.post('/forgot-password', forgotPassword as RequestHandler);
router.post('/reset-password', resetPassword as RequestHandler);

export default router;
