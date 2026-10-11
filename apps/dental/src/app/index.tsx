import { APP_NAME } from '@quantam/shared';
import { Badge, Button, Card, HeroBand, Screen, Text, type BadgeTone } from '@quantam/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Platform, View } from 'react-native';

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

const statusBadge: Record<Status, { label: string; tone: BadgeTone; hint: string }> = {
  'not-configured': {
    label: 'Not configured',
    tone: 'neutral',
    hint: 'Add your Supabase URL and anon key to apps/dental/.env.',
  },
  checking: { label: 'Checking', tone: 'brand', hint: 'Contacting Supabase.' },
  connected: { label: 'Connected', tone: 'success', hint: 'Supabase is reachable.' },
  error: { label: 'Unreachable', tone: 'danger', hint: 'Check the Supabase URL and anon key.' },
};

export default function HomeScreen() {
  const status = statusBadge[useSupabaseStatus()];

  return (
    <Screen>
      <HeroBand className="mt-2">
        <Text variant="title" tone="on-hero">
          {APP_NAME}
        </Text>
        <Text tone="on-hero-muted">
          Patients, appointments and reminders on web, Android and iOS.
        </Text>
      </HeroBand>

      <Card className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <Text variant="heading">Backend</Text>
          <Badge label={status.label} tone={status.tone} />
        </View>
        <Text variant="small" tone="muted">
          {status.hint}
        </Text>
        <Text variant="data" tone="subtle">
          platform: {Platform.OS}
        </Text>
      </Card>

      <View className="flex-row flex-wrap gap-3">
        <Link href="/design" asChild>
          <Button title="View design system" />
        </Link>
        <Button title="Patients" variant="secondary" disabled />
      </View>
    </Screen>
  );
}
