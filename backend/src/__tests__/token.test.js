import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

describe('Token utilities', () => {
  it('generates a valid JWT', () => {
    const token = generateToken({ sub: 'user-1', role: 'ADMIN' });
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('verifies a valid token', () => {
    const token = generateToken({ sub: 'user-1', role: 'ADMIN' });
    const payload = verifyToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('ADMIN');
  });

  it('throws for invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });

  it('throws for expired token', () => {
    const token = jwt.sign({ sub: 'user-1' }, JWT_SECRET, { expiresIn: '0s' });
    expect(() => verifyToken(token)).toThrow();
  });
});
