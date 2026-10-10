import { View } from 'react-native';

import { Button } from './button';
import { Text } from './text';

/**
 * Decorative rangoli-style dot border in the festival accent. Hidden from screen readers
 * and never the only place information appears.
 */
export function FestiveDots({
  count = 14,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`flex-row items-center gap-1.5 ${className}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          className={`rounded-full ${i % 3 === 1 ? 'size-2 bg-festive-accent' : 'size-1.5 bg-on-festive opacity-60'}`}
        />
      ))}
    </View>
  );
}

export type OfferBannerProps = {
  /** Festival greeting, e.g. "Happy Deepavali". */
  greeting: string;
  /** What the offer is for, e.g. "Teeth whitening". */
  title: string;
  /** The headline number, kept short: "20% off", "₹999". */
  offer: string;
  /** Validity in plain words, e.g. "Till 15 Nov". */
  validity: string;
  ctaTitle?: string;
  onPress?: () => void;
  className?: string;
};

/**
 * Festival offer card. Colours come from the festive tokens, so the same banner turns
 * saffron for Sankranti or indigo-and-gold for Deepavali without code changes.
 * Everything inside uses on-festive, which passes AA on both gradient stops.
 */
export function OfferBanner({
  greeting,
  title,
  offer,
  validity,
  ctaTitle = 'Book now',
  onPress,
  className = '',
}: OfferBannerProps) {
  return (
    <View
      className={`gap-3 overflow-hidden rounded-container bg-linear-to-br from-festive to-festive-end p-5 ${className}`}
    >
      <FestiveDots />
      <Text variant="label" tone="on-festive" className="uppercase tracking-[1px]">
        {greeting}
      </Text>
      <View className="gap-1">
        <Text variant="display" tone="on-festive">
          {offer}
        </Text>
        <Text variant="heading" tone="on-festive">
          {title}
        </Text>
      </View>
      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <Text variant="small" tone="on-festive">
          {validity}
        </Text>
        {/* A surface-coloured pill with ink text stays readable on every festival palette. */}
        {onPress ? <Button title={ctaTitle} variant="secondary" onPress={onPress} /> : null}
      </View>
    </View>
  );
}
