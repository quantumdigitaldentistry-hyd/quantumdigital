import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

/**
 * Type scale. Each step sets size, line height and the weight-specific font family
 * (Android needs the family per weight; see apps/dental/src/global.css).
 *
 * display/title/heading: Sora, the geometric face that echoes the QUANTUM wordmark.
 * body and below: Instrument Sans. data: IBM Plex Mono so times, phones and IDs align.
 */
const variants = {
  display: 'font-display-bold text-[32px] leading-[40px] tracking-[-0.6px]',
  title: 'font-display text-2xl leading-8 tracking-[-0.3px]',
  heading: 'font-display text-lg leading-6',
  body: 'font-sans text-base leading-6',
  'body-strong': 'font-sans-medium text-base leading-6',
  small: 'font-sans text-sm leading-5',
  label: 'font-sans-medium text-[13px] leading-4',
  caption: 'font-sans text-xs leading-4',
  data: 'font-mono text-sm leading-5',
  'data-strong': 'font-mono-medium text-sm leading-5',
} as const;

/**
 * Text colours. Pick the tone that matches the background the text sits on:
 * `on-x` tones are only for text placed on `bg-x`. Each pair passes WCAG AA in both themes.
 */
const tones = {
  default: 'text-ink',
  muted: 'text-ink-muted',
  subtle: 'text-ink-subtle',
  brand: 'text-brand',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  'on-brand': 'text-on-brand',
  'on-brand-soft': 'text-on-brand-soft',
  'on-danger': 'text-on-danger',
  'on-aqua-soft': 'text-on-aqua-soft',
  'on-hero': 'text-on-hero',
  'on-hero-muted': 'text-on-hero-muted',
  'on-highlight': 'text-on-highlight',
  'on-highlight-soft': 'text-on-highlight-soft',
  'on-festive': 'text-on-festive',
  'on-festive-soft': 'text-on-festive-soft',
} as const;

export type TextVariant = keyof typeof variants;
export type TextTone = keyof typeof tones;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  /** Set colour here, not via a text-* class in className: two colour classes conflict. */
  tone?: TextTone;
  className?: string;
};

export function Text({ variant = 'body', tone = 'default', className = '', ...rest }: TextProps) {
  return <RNText className={`${variants[variant]} ${tones[tone]} ${className}`} {...rest} />;
}
