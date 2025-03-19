/**
 * UI component library exports
 */

export const UI_VERSION = '1.0.0';

/**
 * Button props interface
 */
export interface ButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * A placeholder for future UI components
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Button = (_props: ButtonProps): JSX.Element => {
  // This is just a placeholder implementation
  return {} as unknown as JSX.Element;
}; 