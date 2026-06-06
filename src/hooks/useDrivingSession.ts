import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Accelerometer,
  DeviceMotion,
  Gyroscope,
  Magnetometer,
} from 'expo-sensors';
import { SENSOR_UPDATE_INTERVAL_MS } from '@/constants/thresholds';
import { EventDetector } from '@/services/eventDetector';
import { buildSessionSummary, calculateScore } from '@/services/scoreCalculator';
import type {
  DrivingEvent,
  DrivingSession,
  EventCounts,
  LiveSensorData,
  SensorSnapshot,
} from '@/types/driving';
import { EMPTY_EVENT_COUNTS } from '@/types/driving';
import { magnitude } from '@/utils/math';
import { getSafetyRating } from '@/constants/thresholds';

const defaultSnapshot: SensorSnapshot = {
  accelerometer: { x: 0, y: 0, z: 0 },
  gyroscope: { x: 0, y: 0, z: 0 },
  magnetometer: null,
  deviceMotion: null,
};

export function useDrivingSession() {
  const [isActive, setIsActive] = useState(false);
  const [events, setEvents] = useState<DrivingEvent[]>([]);
  const [eventCounts, setEventCounts] = useState<EventCounts>(EMPTY_EVENT_COUNTS);
  const [score, setScore] = useState(100);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recentEvent, setRecentEvent] = useState<DrivingEvent | null>(null);
  const [liveData, setLiveData] = useState<LiveSensorData>({
    ...defaultSnapshot,
    score: 100,
    magnitude: 1,
    gyroMagnitude: 0,
  });
  const [sensorsAvailable, setSensorsAvailable] = useState({
    accelerometer: false,
    gyroscope: false,
    deviceMotion: false,
    magnetometer: false,
  });

  const detectorRef = useRef(new EventDetector());
  const subscriptionsRef = useRef<{ remove: () => void }[]>([]);
  const sessionRef = useRef({
    startTime: 0,
    sensorSamples: 0,
  });
  const eventsRef = useRef<DrivingEvent[]>([]);
  const snapshotRef = useRef<SensorSnapshot>(defaultSnapshot);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateLiveData = useCallback((nextScore: number) => {
    const accel = snapshotRef.current.deviceMotion?.acceleration ?? snapshotRef.current.accelerometer;
    const rotation = snapshotRef.current.deviceMotion?.rotationRate ?? snapshotRef.current.gyroscope;
    setLiveData({
      ...snapshotRef.current,
      score: nextScore,
      magnitude: magnitude(accel),
      gyroMagnitude: magnitude(rotation),
    });
  }, []);

  const processSnapshot = useCallback((timestamp: number) => {
    sessionRef.current.sensorSamples += 1;
    const detected = detectorRef.current.analyze(snapshotRef.current, timestamp);
    const currentScore = calculateScore(eventsRef.current);

    if (detected.length === 0) {
      updateLiveData(currentScore);
      return;
    }

    const merged = [...eventsRef.current, ...detected];
    eventsRef.current = merged;
    const nextScore = calculateScore(merged);

    setEvents(merged);
    setScore(nextScore);
    setEventCounts((counts) => {
      const next = { ...counts };
      for (const event of detected) {
        next[event.type] += 1;
      }
      return next;
    });
    updateLiveData(nextScore);

    const latest = detected[detected.length - 1];
    setRecentEvent(latest);
    if (recentTimeoutRef.current) {
      clearTimeout(recentTimeoutRef.current);
    }
    recentTimeoutRef.current = setTimeout(() => setRecentEvent(null), 2500);
  }, [updateLiveData]);

  const stopSubscriptions = useCallback(() => {
    subscriptionsRef.current.forEach((subscription) => subscription.remove());
    subscriptionsRef.current = [];
  }, []);

  const startDrive = useCallback(async () => {
    const [accelAvailable, gyroAvailable, motionAvailable, magnetAvailable] = await Promise.all([
      Accelerometer.isAvailableAsync(),
      Gyroscope.isAvailableAsync(),
      DeviceMotion.isAvailableAsync(),
      Magnetometer.isAvailableAsync(),
    ]);

    setSensorsAvailable({
      accelerometer: accelAvailable,
      gyroscope: gyroAvailable,
      deviceMotion: motionAvailable,
      magnetometer: magnetAvailable,
    });

    detectorRef.current.reset();
    snapshotRef.current = { ...defaultSnapshot };
    sessionRef.current = { startTime: Date.now(), sensorSamples: 0 };
    eventsRef.current = [];
    setEvents([]);
    setEventCounts(EMPTY_EVENT_COUNTS);
    setScore(100);
    setElapsedMs(0);
    setRecentEvent(null);
    setLiveData({
      ...defaultSnapshot,
      score: 100,
      magnitude: 1,
      gyroMagnitude: 0,
    });
    setIsActive(true);

    Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);
    Gyroscope.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);
    DeviceMotion.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);
    Magnetometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);

    stopSubscriptions();

    if (accelAvailable) {
      subscriptionsRef.current.push(
        Accelerometer.addListener((data) => {
          snapshotRef.current = {
            ...snapshotRef.current,
            accelerometer: data,
          };
        }),
      );
    }

    if (gyroAvailable) {
      subscriptionsRef.current.push(
        Gyroscope.addListener((data) => {
          snapshotRef.current = {
            ...snapshotRef.current,
            gyroscope: data,
          };
        }),
      );
    }

    if (motionAvailable) {
      subscriptionsRef.current.push(
        DeviceMotion.addListener((data) => {
          const rotationRate = data.rotationRate
            ? {
                x: (data.rotationRate.beta ?? 0) * (Math.PI / 180),
                y: (data.rotationRate.gamma ?? 0) * (Math.PI / 180),
                z: (data.rotationRate.alpha ?? 0) * (Math.PI / 180),
              }
            : snapshotRef.current.gyroscope;

          const acceleration = data.accelerationIncludingGravity
            ? {
                x: (data.accelerationIncludingGravity.x ?? 0) / 9.80665,
                y: (data.accelerationIncludingGravity.y ?? 0) / 9.80665,
                z: (data.accelerationIncludingGravity.z ?? 0) / 9.80665,
              }
            : snapshotRef.current.accelerometer;

          snapshotRef.current = {
            ...snapshotRef.current,
            deviceMotion: {
              acceleration,
              rotationRate,
            },
          };
        }),
      );
    }

    if (magnetAvailable) {
      subscriptionsRef.current.push(
        Magnetometer.addListener((data) => {
          snapshotRef.current = {
            ...snapshotRef.current,
            magnetometer: data,
          };
        }),
      );
    }

    timerRef.current = setInterval(() => {
      const now = Date.now();
      setElapsedMs(now - sessionRef.current.startTime);
      processSnapshot(now);
    }, SENSOR_UPDATE_INTERVAL_MS);
  }, [processSnapshot, stopSubscriptions]);

  const endDrive = useCallback((): DrivingSession => {
    const endTime = Date.now();
    const startTime = sessionRef.current.startTime;
    const sessionEvents = eventsRef.current;
    const summary = buildSessionSummary(
      sessionEvents,
      startTime,
      endTime,
      sessionRef.current.sensorSamples,
    );

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopSubscriptions();
    setIsActive(false);

    const session: DrivingSession = {
      id: `session-${startTime}`,
      startTime,
      endTime,
      durationMs: summary.durationMs,
      events: sessionEvents,
      eventCounts: summary.eventCounts,
      score: summary.score,
      safetyRating: summary.safetyRating,
      sensorSamples: summary.sensorSamples,
    };

    return session;
  }, [stopSubscriptions]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recentTimeoutRef.current) {
        clearTimeout(recentTimeoutRef.current);
      }
      stopSubscriptions();
    };
  }, [stopSubscriptions]);

  return {
    isActive,
    events,
    eventCounts,
    score,
    safetyRating: getSafetyRating(score),
    elapsedMs,
    recentEvent,
    liveData,
    sensorsAvailable,
    startDrive,
    endDrive,
  };
}
