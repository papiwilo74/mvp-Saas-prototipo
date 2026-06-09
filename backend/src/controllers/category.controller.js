import * as categoryService from '../services/category.service.js';

export const list = async (req, res) => {
  const categories = await categoryService.listCategories(req.user.restaurantId);
  res.json({ categories });
};

export const create = async (req, res) => {
  const category = await categoryService.createCategory(req.user.restaurantId, req.validated.body);
  res.status(201).json({ category });
};

