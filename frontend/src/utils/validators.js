const COLOMBIAN_PHONE_REGEX = /^3\d{9}$/;

export function isValidColombianPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return COLOMBIAN_PHONE_REGEX.test(cleaned);
}

export function cleanPhone(phone) {
  return (phone || '').replace(/\D/g, '');
}

export function formatColombianPhone(phone) {
  const cleaned = cleanPhone(phone);
  if (cleaned.length === 10) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  return phone;
}
