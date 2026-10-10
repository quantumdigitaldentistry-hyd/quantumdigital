import type { ReactNode } from 'react';
import { View } from 'react-native';

/** Container for grouped content. Hierarchy comes from the border, not a drop shadow. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <View className={`rounded-container border border-line bg-surface p-4 ${className}`}>
      {children}
    </View>
  );
}
