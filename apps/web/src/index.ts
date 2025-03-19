/**
 * Web application entry point
 */

/**
 * Constants for the web application
 */
export const WEB_VERSION = '1.0.0';

/**
 * Web application utilities
 */
export const webUtils = {
  /**
   * Format date for display
   */
  formatDate: (date: Date): string => {
    return date.toLocaleDateString();
  },
};
