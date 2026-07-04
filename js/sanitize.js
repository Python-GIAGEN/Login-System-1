export function sanitizeEmail(email) {
  return email.trim().replace(/[<>"'()]/g, "");
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(pw) {
  return pw.length >= 8;
}
