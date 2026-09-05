import * as authService from '../services/auth.service.js';
import { toPublicUser } from '../dto/user.dto.js';

const getCookieOpts = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  ...(maxAge !== undefined && { maxAge })
});

export const register = async (req, res) => {
  const result = await authService.register(req.validated.body);

  res.cookie('ff_token', result.token, getCookieOpts(15 * 60 * 1000));
  res.cookie('ff_refresh', result.refreshToken, getCookieOpts(7 * 24 * 60 * 60 * 1000));

  res.status(201).json({ user: toPublicUser(result.user) });
};

export const registerRestaurant = async (req, res) => {
  const result = await authService.registerRestaurant(req.validated.body);

  res.cookie('ff_token', result.token, getCookieOpts(15 * 60 * 1000));
  res.cookie('ff_refresh', result.refreshToken, getCookieOpts(7 * 24 * 60 * 60 * 1000));

  res.status(201).json({
    user: toPublicUser(result.user),
    restaurant: result.restaurant
  });
};

export const login = async (req, res) => {
  const result = await authService.login(req.validated.body);

  res.cookie('ff_token', result.token, getCookieOpts(15 * 60 * 1000));
  res.cookie('ff_refresh', result.refreshToken, getCookieOpts(7 * 24 * 60 * 60 * 1000));

  res.json({ user: toPublicUser(result.user) });
};

export const verifyEmail = async (req, res) => {
  const result = await authService.verifyEmail(req.validated.body);
  res.json(result);
};

export const logout = async (req, res) => {
  if (req.user) {
    await authService.revokeRefreshTokens(req.user.id);
  }
  res.clearCookie('ff_token', getCookieOpts());
  res.clearCookie('ff_refresh', getCookieOpts());
  res.json({ message: 'Sesión cerrada exitosamente' });
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

  res.cookie('ff_token', result.token, getCookieOpts(15 * 60 * 1000));
  res.cookie('ff_refresh', result.refreshToken, getCookieOpts(7 * 24 * 60 * 60 * 1000));

  res.json({ user: toPublicUser(result.user) });
};
