import crypto from 'crypto';

const CSRF_COOKIE = 'csrf-token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.includes(req.method)) return next();

  const tokenCookie = req.cookies[CSRF_COOKIE];
  const tokenHeader = req.headers[CSRF_HEADER];

  if (!tokenCookie) return next();

  if (!tokenHeader || tokenCookie !== tokenHeader) {
    return res.status(403).json({ error: 'Token CSRF invalido' });
  }

  next();
};

export const setCsrfToken = (req, res, next) => {
  if (req.cookies[CSRF_COOKIE]) return next();

  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  next();
};