import { APP_NAME } from '@quantam/shared';
import { Button, Card, Screen } from '@quantam/ui';
import { useQuery } from '@tanstack/react-query';
import { Platform, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

type Status = 'not-configured' | 'checking' | 'connected' | 'error';

function useSupabaseStatus(): Status {
  const { status } = useQuery({
    queryKey: ['supabase-health'],
    enabled: supabase !== null,
    retry: false,
    queryFn: async () => {
      const { error } = await supabase!.auth.getSession();
      if (error) throw error;
      return true;
    },
  });
  if (!supabase) return 'not-configured';
  if (status === 'pending') return 'checking';
  return status === 'success' ? 'connected' : 'error';
}

const statusLabel: Record<Status, { text: string; dot: string }> = {
  'not-configured': { text: 'Supabase not configured — add apps/dental/.env', dot: 'bg-slate-400' },
  checking: { text: 'Checking Supabase…', dot: 'bg-accent' },
  connected: { text: 'Supabase connected', dot: 'bg-emerald-500' },
  error: { text: 'Supabase unreachable — check URL / anon key', dot: 'bg-red-500' },
};

export default function HomeScreen() {
  const status = statusLabel[useSupabaseStatus()];

  return (
    <Screen>
      <View className="gap-1 pt-6">
        <Text className="text-3xl font-bold text-primary">{APP_NAME}</Text>
        <Text className="text-base text-slate-600 dark:text-slate-400">
          Patients, appointments and reminders — on web, Android and iOS.
        </Text>
      </View>

      <Card className="gap-3">
        <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Scaffold status
        </Text>
        <View className="flex-row items-center gap-2">
          <View className={`size-2.5 rounded-full ${status.dot}`} />
          <Text className="text-slate-700 dark:text-slate-300">{status.text}</Text>
        </View>
        <Text className="text-slate-500">Running on: {Platform.OS}</Text>
      </Card>

      <View className="flex-row flex-wrap gap-3">
        <Button title="Patients (soon)" disabled />
        <Button title="Appointments (soon)" variant="secondary" disabled />
      </View>
    </Screen>
  );
}
