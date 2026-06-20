import * as authService from '../services/auth.service.js';

export const login = async (req, res) => {
  const result = await authService.login(req.validated.body);
  res.json(result);
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};