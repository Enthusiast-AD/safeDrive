import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EventBreakdown } from '@/components/EventBreakdown';
import { ScoreRing } from '@/components/ScoreRing';
import { getLastSession } from '@/store/sessionStore';
import { getTotalEvents } from '@/services/scoreCalculator';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardScreen() {
  const session = getLastSession();

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={48} color="#64748B" />
          <Text style={styles.emptyTitle}>No drive session yet</Text>
          <Text style={styles.emptyText}>Complete a drive to see your dashboard.</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>Go Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalEvents = getTotalEvents(session.eventCounts);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drive Summary</Text>
        <Text style={styles.headerSubtitle}>Session dashboard & analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScoreRing score={session.score} safetyRating={session.safetyRating} />

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Ionicons name="timer-outline" size={22} color="#F97316" />
            <Text style={styles.summaryValue}>{formatDuration(session.durationMs)}</Text>
            <Text style={styles.summaryLabel}>Drive Duration</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="warning-outline" size={22} color="#EF4444" />
            <Text style={styles.summaryValue}>{totalEvents}</Text>
            <Text style={styles.summaryLabel}>Total Events</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="pulse-outline" size={22} color="#38BDF8" />
            <Text style={styles.summaryValue}>{session.sensorSamples}</Text>
            <Text style={styles.summaryLabel}>Sensor Samples</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#22C55E" />
            <Text style={styles.summaryValue}>{session.score}</Text>
            <Text style={styles.summaryLabel}>Final Score</Text>
          </View>
        </View>

        <EventBreakdown eventCounts={session.eventCounts} />

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Event Timeline</Text>
          {session.events.length === 0 ? (
            <Text style={styles.timelineEmpty}>No events detected — great driving!</Text>
          ) : (
            session.events.map((event) => (
              <View key={event.id} style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>{event.label}</Text>
                  <Text style={styles.timelineMeta}>
                    {formatTime(event.timestamp)} · -{event.penalty} pts
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/drive')}>
          <Text style={styles.primaryButtonText}>Start New Drive</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 18,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    flexGrow: 1,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  timelineCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  timelineTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  timelineEmpty: {
    color: '#64748B',
    fontSize: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F97316',
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  timelineMeta: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
  },
});
