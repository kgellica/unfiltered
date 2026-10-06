// Single source of truth for password rules — Auth (register/forgot) and
// Settings (change password) both score against these same functions, even
// though each screen displays a different subset/visual style.

export const hasMinLength = (pw = '', min = 8) => pw.length >= min;
export const hasUppercase = (pw = '') => /[A-Z]/.test(pw);
export const hasLowercase = (pw = '') => /[a-z]/.test(pw);
export const hasNumber = (pw = '') => /\d/.test(pw);
export const hasSymbol = (pw = '') => /[@$!%*?&#^()_\-+=]/.test(pw);

export const PASSWORD_RULE_DEFS = {
  length: { label: '8+ chars', test: hasMinLength },
  upper: { label: 'uppercase', test: hasUppercase },
  lower: { label: 'lowercase', test: hasLowercase },
  number: { label: '1 number', test: hasNumber },
  symbol: { label: 'symbol', test: hasSymbol },
};

export const ALL_PASSWORD_RULE_KEYS = Object.keys(PASSWORD_RULE_DEFS);

// Scores a password against a chosen subset of rules (defaults to all 5).
// Settings only cares about 3 of these — pass `['length', 'upper', 'number']`.
export function getPasswordChecks(password = '', ruleKeys = ALL_PASSWORD_RULE_KEYS) {
  const checks = ruleKeys.map((key) => {
    const rule = PASSWORD_RULE_DEFS[key];
    return { key, label: rule.label, valid: rule.test(password) };
  });
  const passedCount = checks.filter((c) => c.valid).length;
  return { checks, passedCount, total: checks.length };
}

// Returns unmet rule labels, e.g. ['8+ chars', '1 number'] — empty = valid.
export function validatePassword(password, ruleKeys = ALL_PASSWORD_RULE_KEYS) {
  if (!password) return ['password is required'];
  return getPasswordChecks(password, ruleKeys).checks
    .filter((c) => !c.valid)
    .map((c) => c.label);
}