import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const menuRouter = Router();

const CACHE_FIVE_MINUTES = 300;

menuRouter.get('/', (_req, res, next) => {
  res.set('Cache-Control', `public, max-age=${CACHE_FIVE_MINUTES}`);
  next();
}, asyncHandler(menuController.getMenu));
