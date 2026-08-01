import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = the neutral action fill (13.59:1 light / 15.56:1 dark) — never the brand orange. */
  variant?: ButtonVariant;
  /**
   * Irreversible actions only (send, sign). Uses the critical fill, which is defined in BOTH
   * themes — a light-only definition once made the confirm button invisible in dark mode.
   */
  critical?: boolean;
}

/**
 * The canonical Crust button. Class names bind to styles.css, which is byte-identical to the CSS
 * the design-system specimens render from — what the designer approved is what this renders.
 *
 * Rules the type system cannot enforce, so read them:
 * - The label NEVER wraps. If it needs two lines, shorten the words (`Continue backup` → `Back up`).
 * - No new variants here without a specimen in the design system first.
 */
export function Button({ variant = 'primary', critical = false, className, type, ...rest }: ButtonProps) {
  const cls = ['btn', `btn-${variant}`, critical ? 'critical' : null, className]
    .filter(Boolean)
    .join(' ');
  return <button type={type ?? 'button'} className={cls} {...rest} />;
}
