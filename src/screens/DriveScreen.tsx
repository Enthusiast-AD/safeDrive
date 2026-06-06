import { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EventToast } from '@/components/EventToast';
import { ScoreRing } from '@/components/ScoreRing';
import { SensorCard } from '@/components/SensorCard';
import { useDrivingSession } from '@/hooks/useDrivingSession';
import { setLastSession } from '@/store/sessionStore';
import { getTotalEvents } from '@/services/scoreCalculator';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function DriveScreen() {
  const {
    isActive,
    score,
    safetyRating,
    elapsedMs,
    recentEvent,
    liveData,
    eventCounts,
    sensorsAvailable,
    startDrive,
    endDrive,
  } = useDrivingSession();

  useEffect(() => {
    startDrive();
  }, [startDrive]);

  const handleEndDrive = () => {
    const session = endDrive();
    setLastSession(session);
    router.replace('/summary');
  };

  const totalEvents = getTotalEvents(eventCounts);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#F8FAFC" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Active Drive</Text>
          <Text style={styles.headerSubtitle}>
            {isActive ? 'Sensors running' : 'Session paused'}
          </Text>
        </View>
        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={14} color="#F97316" />
          <Text style={styles.timerText}>{formatDuration(elapsedMs)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.toastContainer}>
          <EventToast event={recentEvent} />
        </View>

        <ScoreRing score={score} safetyRating={safetyRating} />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalEvents}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{liveData.magnitude.toFixed(2)}g</Text>
            <Text style={styles.statLabel}>Accel Magnitude</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{liveData.gyroMagnitude.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Gyro (rad/s)</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Live Sensor Readings</Text>
        <View style={styles.sensorRow}>
          <SensorCard
            label="Accelerometer"
            values={liveData.accelerometer}
            unit="g"
            color="#38BDF8"
          />
          <SensorCard
            label="Gyroscope"
            values={liveData.gyroscope}
            unit="rad/s"
            color="#A78BFA"
          />
        </View>

        <View style={styles.sensorRow}>
          <SensorCard
            label="Device Motion"
            values={
              liveData.deviceMotion?.acceleration ?? liveData.accelerometer
            }
            unit="g (user accel)"
            color="#34D399"
          />
          <SensorCard
            label="Magnetometer"
            values={liveData.magnetometer ?? { x: 0, y: 0, z: 0 }}
            unit="µT"
            color="#FBBF24"
          />
        </View>

        <View style={styles.availabilityCard}>
          <Text style={styles.availabilityTitle}>Sensor Availability</Text>
          <Text style={styles.availabilityText}>
            Accelerometer: {sensorsAvailable.accelerometer ? 'On' : 'Off'} · Gyroscope:{' '}
            {sensorsAvailable.gyroscope ? 'On' : 'Off'} · Device Motion:{' '}
            {sensorsAvailable.deviceMotion ? 'On' : 'Off'} · Magnetometer:{' '}
            {sensorsAvailable.magnetometer ? 'On' : 'Off'}
          </Text>
        </View>

        <Text style={styles.tip}>
          Tip: Shake the phone sharply to simulate harsh events, rotate quickly for sharp turns,
          and pick up the phone to trigger handling detection.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}
          onPress={handleEndDrive}
        >
          <Ionicons name="stop-circle" size={22} color="#FFFFFF" />
          <Text style={styles.endButtonText}>END DRIVE</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  timerBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: '#F97316',
    fontWeight: '800',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 16,
  },
  toastContainer: {
    minHeight: 72,
    width: '100%',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  sensorRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  availabilityCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  availabilityTitle: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  availabilityText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },
  tip: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 30,
  },
  endButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
