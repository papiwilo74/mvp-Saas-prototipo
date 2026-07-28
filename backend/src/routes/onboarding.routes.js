import { Router } from 'express';
import * as onboardingController from '../controllers/onboarding.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const onboardingRouter = Router();

onboardingRouter.use(authenticate, requireAdmin);
onboardingRouter.get('/status', asyncHandler(onboardingController.status));
onboardingRouter.post('/complete', asyncHandler(onboardingController.complete));