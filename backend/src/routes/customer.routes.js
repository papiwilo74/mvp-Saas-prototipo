import { Router } from 'express';
import * as customerController from '../controllers/customer.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { customerIdSchema, listCustomersSchema, updateCustomerNotesSchema } from '../validators/customer.validator.js';

export const customerRouter = Router();

customerRouter.use(authenticate, requireAdmin);
customerRouter.get('/', validate(listCustomersSchema), asyncHandler(customerController.list));
customerRouter.get('/:id', validate(customerIdSchema), asyncHandler(customerController.detail));
customerRouter.patch('/:id/notes', validate(updateCustomerNotesSchema), asyncHandler(customerController.updateNotes));