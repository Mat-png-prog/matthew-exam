export const AUTH_CONFIG = {
  MAX_PASSWORD_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15, // minutes
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    maxLength: 64,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecial: true
  }
} as const;