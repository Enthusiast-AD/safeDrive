import { StyleSheet, Text, View } from 'react-native';
import { EVENT_LABELS } from '@/constants/thresholds';
import type { EventCounts } from '@/types/driving';

interface Props {
  eventCounts: EventCounts;
}

const EVENT_ORDER = Object.keys(EVENT_LABELS) as (keyof EventCounts)[];

export function EventBreakdown({ eventCounts }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Breakdown</Text>
      {EVENT_ORDER.map((type, index) => (
        <View
          key={type}
          style={[
            styles.row,
            index === EVENT_ORDER.length - 1 && { borderBottomWidth: 0 },
          ]}>

          <Text style={styles.label}>{EVENT_LABELS[type]}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.count}>{eventCounts[type]}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    width: '100%',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  label: {
    color: '#CBD5E1',
    fontSize: 14,
    flex: 1,
  },
  countBadge: {
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    alignItems: 'center',
  },
  count: {
    color: '#F97316',
    fontWeight: '800',
    fontSize: 14,
  },
});
