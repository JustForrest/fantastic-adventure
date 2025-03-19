/**
 * Authentication package exports
 */

export const AUTH_VERSION = '1.0.0';

/**
 * Authentication utilities
 */
export const authUtils = {
  /**
   * Validates token format
   */
  validateToken: (token: string): boolean => {
    return token.length > 10;
  },
};
