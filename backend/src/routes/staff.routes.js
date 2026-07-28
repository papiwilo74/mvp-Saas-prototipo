import { Router } from 'express';
import * as staffController from '../controllers/staff.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createStaffSchema, updateStaffSchema, verifyPinSchema } from '../validators/staff.validator.js';

export const staffRouter = Router();

staffRouter.use(authenticate, requireAdmin);
staffRouter.get('/', asyncHandler(staffController.list));
staffRouter.post('/', validate(createStaffSchema), asyncHandler(staffController.create));
staffRouter.put('/:id', validate(updateStaffSchema), asyncHandler(staffController.update));
staffRouter.delete('/:id', asyncHandler(staffController.remove));
staffRouter.post('/verify-pin', validate(verifyPinSchema), asyncHandler(staffController.verifyPin));