import { StyleSheet, Text, View } from 'react-native';
import type { Vector3 } from '@/types/driving';

interface Props {
  label: string;
  values: Vector3;
  unit: string;
  color: string;
}

function formatValue(value: number): string {
  return value.toFixed(2);
}

export function SensorCard({ label, values, unit, color }: Props) {
  return (
    <View style={styles.card}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.axis}>X</Text>
        <Text style={styles.value}>{formatValue(values.x)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.axis}>Y</Text>
        <Text style={styles.value}>{formatValue(values.y)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.axis}>Z</Text>
        <Text style={styles.value}>{formatValue(values.z)}</Text>
      </View>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  axis: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 10,
  },
});
