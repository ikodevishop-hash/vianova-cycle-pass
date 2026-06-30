/** Shared input validators (ported from the prototype). */
export const reAlnum = (s: string) => /^[A-Za-z0-9]+$/.test(s);
export const reEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
/** 8+ chars including at least one letter and one digit; symbols allowed. */
export const validPw = (s: string) => s.length >= 8 && /[A-Za-z]/.test(s) && /[0-9]/.test(s);
