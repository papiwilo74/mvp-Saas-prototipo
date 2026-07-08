import { describe, it, expect } from 'vitest';
import { isValidColombianPhone, cleanPhone, formatColombianPhone } from '../utils/validators';
import { formatCurrency, formatDate } from '../utils/formatters';

describe('validators', () => {
  it('valida numeros colombianos validos', () => {
    expect(isValidColombianPhone('3001234567')).toBe(true);
    expect(isValidColombianPhone('3207654321')).toBe(true);
    expect(isValidColombianPhone('3500000000')).toBe(true);
  });

  it('rechaza numeros invalidos', () => {
    expect(isValidColombianPhone('2001234567')).toBe(false);
    expect(isValidColombianPhone('')).toBe(false);
    expect(isValidColombianPhone(null)).toBe(false);
    expect(isValidColombianPhone('300123')).toBe(false);
  });

  it('limpia caracteres no numericos', () => {
    expect(cleanPhone('300-123-4567')).toBe('3001234567');
    expect(cleanPhone('+57 3001234567')).toBe('573001234567');
    expect(cleanPhone('(300) 123 4567')).toBe('3001234567');
  });

  it('formatea numeros colombianos', () => {
    expect(formatColombianPhone('3001234567')).toBe('(300) 123 4567');
  });
});

describe('formatters', () => {
  it('formatea moneda COP', () => {
    const result = formatCurrency(29900);
    expect(result).toContain('29.900');
  });

  it('formatea fechas', () => {
    const date = '2026-01-15T10:30:00';
    const result = formatDate(date);
    expect(result).toContain('2026');
    expect(result).toContain('15');
  });
});
