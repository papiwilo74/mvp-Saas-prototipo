import * as superadminService from '../services/superadmin.service.js';

export const stats = async (_req, res) => {
  const data = await superadminService.getSuperadminStats();
  res.json(data);
};

export const listRestaurants = async (_req, res) => {
  const restaurants = await superadminService.listRestaurants();
  res.json({ restaurants });
};

export const getRestaurant = async (req, res) => {
  const restaurant = await superadminService.getRestaurant(req.validated.params.id);
  res.json({ restaurant });
};

export const createRestaurant = async (req, res) => {
  const restaurant = await superadminService.createRestaurant(req.validated.body);
  res.status(201).json({ restaurant });
};

export const updateRestaurant = async (req, res) => {
  const restaurant = await superadminService.updateRestaurant(req.validated.params.id, req.validated.body);
  res.json({ restaurant });
};
