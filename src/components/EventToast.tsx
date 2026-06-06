import { StyleSheet, Text, View } from 'react-native';
import type { DrivingEvent } from '@/types/driving';

interface Props {
  event: DrivingEvent | null;
}

export function EventToast({ event }: Props) {
  if (!event) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Detected</Text>
      <Text style={styles.label}>{event.label}</Text>
      <Text style={styles.penalty}>-{event.penalty} points</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(239, 68, 68, 0.92)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    color: '#FEE2E2',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  penalty: {
    color: '#FECACA',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
