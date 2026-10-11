import type { ReactNode } from 'react';
import { View } from 'react-native';

/**
 * The clinic's aqua sky as a gradient band: screen headers, the dashboard greeting,
 * marketing heroes. Text inside uses tone="on-hero" / "on-hero-muted", which pass AA on
 * both gradient stops. Use one per screen at most; content below sits on plain canvas.
 */
export function HeroBand({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`gap-2 rounded-container bg-linear-to-br from-hero-from to-hero-to p-5 ${className}`}
    >
      {children}
    </View>
  );
}
