import { Router } from 'express';
import * as staffController from '../controllers/staff.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const staffRouter = Router();

staffRouter.use(authenticate, requireAdmin);
staffRouter.get('/', asyncHandler(staffController.list));
staffRouter.post('/', asyncHandler(staffController.create));
staffRouter.put('/:id', asyncHandler(staffController.update));
staffRouter.delete('/:id', asyncHandler(staffController.remove));
staffRouter.post('/verify-pin', asyncHandler(staffController.verifyPin));