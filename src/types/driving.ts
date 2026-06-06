export type DrivingEventType =
  | 'harsh_braking'
  | 'harsh_acceleration'
  | 'sharp_turn'
  | 'aggressive_steering'
  | 'excessive_movement'
  | 'phone_handling';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface DrivingEvent {
  id: string;
  type: DrivingEventType;
  timestamp: number;
  penalty: number;
  label: string;
  magnitude?: number;
}

export interface SensorSnapshot {
  accelerometer: Vector3;
  gyroscope: Vector3;
  magnetometer: Vector3 | null;
  deviceMotion: {
    acceleration: Vector3;
    rotationRate: Vector3;
  } | null;
}

export interface EventCounts {
  harsh_braking: number;
  harsh_acceleration: number;
  sharp_turn: number;
  aggressive_steering: number;
  excessive_movement: number;
  phone_handling: number;
}

export interface DrivingSession {
  id: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  events: DrivingEvent[];
  eventCounts: EventCounts;
  score: number;
  safetyRating: string;
  sensorSamples: number;
}

export interface LiveSensorData extends SensorSnapshot {
  score: number;
  magnitude: number;
  gyroMagnitude: number;
}

export const EMPTY_EVENT_COUNTS: EventCounts = {
  harsh_braking: 0,
  harsh_acceleration: 0,
  sharp_turn: 0,
  aggressive_steering: 0,
  excessive_movement: 0,
  phone_handling: 0,
};
