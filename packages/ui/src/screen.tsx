import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

// Third-party components need withUniwind to accept className.
const SafeAreaView = withUniwind(RNSafeAreaView);

/** Page wrapper: safe areas on native, centered max-width column on wide web screens. */
export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView contentContainerClassName="grow">
        <View className={`w-full max-w-3xl self-center gap-4 px-4 py-6 ${className}`}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
