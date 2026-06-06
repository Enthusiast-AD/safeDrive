import type { DrivingEventType } from '@/types/driving';

/** Sensor polling interval — 100ms balances responsiveness and battery use. */
export const SENSOR_UPDATE_INTERVAL_MS = 100;

/**
 * Detection thresholds 
 * Accelerometer values are in g (1g ≈ 9.81 m/s²).
 * Gyroscope values are in rad/s.
 */
export const THRESHOLDS = {
  /** Sudden deceleration spike between consecutive samples. */
  HARSH_BRAKE_G: 0.45,
  /** Sudden acceleration spike between consecutive samples. */
  HARSH_ACCEL_G: 0.45,
  /** Yaw rotation rate indicating a sharp turn. */
  SHARP_TURN_RAD_S: 2.0,
  /** Roll/pitch rotation rate indicating aggressive steering. */
  AGGRESSIVE_STEER_RAD_S: 1.5,
  /** Deviation from ~1g when device should be relatively stable. */
  EXCESSIVE_MOVEMENT_G: 0.35,
  /** Combined gyro magnitude suggesting phone pickup. */
  PHONE_HANDLING_GYRO: 2.5,
  /** Accelerometer variance window threshold for phone handling. */
  PHONE_HANDLING_ACCEL_VAR: 0.25,
  /** Magnetometer heading change (degrees) for optional turn validation. */
  MAGNETOMETER_TURN_DEG: 45,
  /** Rolling window size for variance-based detection. */
  VARIANCE_WINDOW: 8,
} as const;

/** Minimum time between duplicate events of the same type. */
export const EVENT_COOLDOWN_MS = 2000;

export const SCORE_PENALTIES: Record<DrivingEventType, number> = {
  harsh_braking: 5,
  harsh_acceleration: 5,
  sharp_turn: 3,
  aggressive_steering: 3,
  excessive_movement: 4,
  phone_handling: 10,
};

export const EVENT_LABELS: Record<DrivingEventType, string> = {
  harsh_braking: 'Harsh Braking',
  harsh_acceleration: 'Harsh Acceleration',
  sharp_turn: 'Sharp Turn',
  aggressive_steering: 'Aggressive Steering',
  excessive_movement: 'Excessive Device Movement',
  phone_handling: 'Phone Handling',
};

export const INITIAL_SCORE = 100;

export function getSafetyRating(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

export function getSafetyRatingColor(score: number): string {
  if (score >= 90) return '#22C55E';
  if (score >= 75) return '#84CC16';
  if (score >= 60) return '#EAB308';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}
