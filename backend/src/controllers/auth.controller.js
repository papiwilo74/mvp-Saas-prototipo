import * as authService from '../services/auth.service.js';
import { toPublicUser } from '../dto/user.dto.js';

const cookieOpts = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge
});

export const register = async (req, res) => {
  const result = await authService.register(req.validated.body);

  res.cookie('ff_token', result.token, cookieOpts(15 * 60 * 1000));
  res.cookie('ff_refresh', result.refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));

  res.status(201).json({ user: toPublicUser(result.user) });
};

export const login = async (req, res) => {
  const result = await authService.login(req.validated.body);

  res.cookie('ff_token', result.token, cookieOpts(15 * 60 * 1000));
  res.cookie('ff_refresh', result.refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));

  res.json({ user: toPublicUser(result.user) });
};

export const logout = async (req, res) => {
  if (req.user) {
    await authService.revokeRefreshTokens(req.user.id);
  }
  res.clearCookie('ff_token', { path: '/' });
  res.clearCookie('ff_refresh', { path: '/' });
  res.json({ message: 'Sesion cerrada' });
};

export const me = async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
};

export const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.validated.body);
  res.json(result);
};

export const resetPassword = async (req, res) => {
  const result = await authService.resetPassword(req.validated.body);
  res.json(result);
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies?.ff_refresh;
  const result = await authService.refresh(refreshToken);

  res.cookie('ff_token', result.token, cookieOpts(15 * 60 * 1000));
  res.cookie('ff_refresh', result.refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));

  res.json({ user: toPublicUser(result.user) });
};