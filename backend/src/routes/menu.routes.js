import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const menuRouter = Router();

menuRouter.get('/', asyncHandler(menuController.getMenu));
