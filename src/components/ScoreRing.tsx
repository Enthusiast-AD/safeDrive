import { StyleSheet, Text, View } from 'react-native';
import { getSafetyRatingColor } from '@/constants/thresholds';

interface Props {
  score: number;
  safetyRating: string;
  compact?: boolean;
}

export function ScoreRing({ score, safetyRating, compact = false }: Props) {
  const color = getSafetyRatingColor(score);

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={[styles.ring, { borderColor: color }]}>
        <Text style={[styles.score, compact && styles.scoreCompact]}>{score}</Text>
      </View>
      <Text style={[styles.rating, { color }]}>{safetyRating}</Text>
      {!compact && <Text style={styles.caption}>Driving Score</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  compact: {
    transform: [{ scale: 0.85 }],
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  score: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreCompact: {
    fontSize: 30,
  },
  rating: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  caption: {
    marginTop: 4,
    color: '#94A3B8',
    fontSize: 12,
  },
});
