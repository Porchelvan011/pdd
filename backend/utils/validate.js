// Input validation & sanitization helpers (hardening: reject bad types, neutralize XSS).

// Returns an error message if any required field is missing or not a string; else null.
export const requireStrings = (obj = {}, fields = []) => {
  for (const f of fields) {
    const v = obj[f];
    if (v === undefined || v === null || v === '') return `Missing required field: ${f}`;
    if (typeof v !== 'string') return `Invalid type for field '${f}': expected a string`;
  }
  return null;
};

export const isString = (v) => typeof v === 'string';

// Strip HTML tags to neutralize stored XSS payloads (defense-in-depth; the UI also escapes on render).
export const sanitizeText = (v) =>
  typeof v === 'string' ? v.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim() : v;
