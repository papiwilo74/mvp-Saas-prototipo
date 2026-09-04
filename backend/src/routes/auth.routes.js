import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createRateLimit } from '../middlewares/rateLimit.middleware.js';
import { env } from '../config/env.js';
import { loginSchema, registerSchema, registerRestaurantSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator.js';

export const authRouter = Router();

const sensitiveAuthLimit = createRateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  maxRequests: env.LOGIN_RATE_LIMIT_MAX,
  keyPrefix: 'auth-sensitive'
});
const recoveryLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyPrefix: 'auth-recovery'
});

authRouter.post('/register', sensitiveAuthLimit, validate(registerSchema), asyncHandler(authController.register));
authRouter.post('/register-restaurant', sensitiveAuthLimit, validate(registerRestaurantSchema), asyncHandler(authController.registerRestaurant));
authRouter.post('/login', sensitiveAuthLimit, validate(loginSchema), asyncHandler(authController.login));
authRouter.get('/me', authenticate, asyncHandler(authController.me));
authRouter.post('/logout', authenticate, asyncHandler(authController.logout));
authRouter.post('/forgot-password', recoveryLimit, validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
authRouter.post('/reset-password', recoveryLimit, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
authRouter.post('/refresh', asyncHandler(authController.refresh));
