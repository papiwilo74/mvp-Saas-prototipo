import * as authService from '../services/auth.service.js';
import { toPublicUser } from '../dto/user.dto.js';

export const login = async (req, res) => {
  const result = await authService.login(req.validated.body);

  res.cookie('ff_token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ user: toPublicUser(result.user) });
};

export const logout = async (_req, res) => {
  res.clearCookie('ff_token');
  res.json({ message: 'Sesion cerrada' });
};

export const me = async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
};
