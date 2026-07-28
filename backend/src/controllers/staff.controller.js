import * as staffService from '../services/staff.service.js';

export const list = async (req, res) => {
  const staff = await staffService.listStaff(req.user.restaurantId);
  res.json(staff);
};

export const create = async (req, res) => {
  const data = req.validated.body;
  const staff = await staffService.createStaff(req.user.restaurantId, data);
  res.status(201).json(staff);
};

export const update = async (req, res) => {
  const data = req.validated.body;
  const staff = await staffService.updateStaff(req.params.id, req.user.restaurantId, data);
  if (!staff) return res.status(404).json({ error: 'Empleado no encontrado' });
  res.json(staff);
};

export const remove = async (req, res) => {
  const ok = await staffService.deleteStaff(req.params.id, req.user.restaurantId);
  if (!ok) return res.status(404).json({ error: 'Empleado no encontrado' });
  res.status(204).send();
};

export const verifyPin = async (req, res) => {
  const { email, pin } = req.validated.body;
  const staff = await staffService.verifyStaffPin(req.user.restaurantId, email, pin);
  if (!staff) return res.status(401).json({ error: 'Credenciales invalidas' });
  res.json(staff);
};