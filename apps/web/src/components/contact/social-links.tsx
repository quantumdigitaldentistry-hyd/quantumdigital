import { socialLinks } from '@/config/site';
import { cx } from '@/lib/cx';

/**
 * Social media icons from config/site.ts. Each becomes a link once its `href` is set;
 * until then it shows as a dimmed, non-interactive icon marked "coming soon".
 */
export function SocialLinks({
  size = 'md',
  className,
}: {
  /** sm fits the top bar; md is a full 44px touch target. */
  size?: 'sm' | 'md';
  className?: string;
}) {
  const box = size === 'sm' ? 'size-8' : 'size-11';
  const icon = size === 'sm' ? 18 : 22;
  return (
    <ul className={cx('flex items-center gap-1', className)} aria-label="Social media">
      {socialLinks.map(({ id, label, Icon, href }) => (
        <li key={id}>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className={cx(
                'grid place-items-center rounded-full transition-[opacity,transform] duration-150 hover:opacity-80 active:scale-95',
                box,
              )}
            >
              <Icon size={icon} weight="fill" aria-hidden />
            </a>
          ) : (
            <span
              role="img"
              aria-label={`${label}, coming soon`}
              title={`${label} (coming soon)`}
              className={cx('grid place-items-center opacity-60', box)}
            >
              <Icon size={icon} weight="fill" aria-hidden />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
