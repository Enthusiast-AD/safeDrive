import {
  EVENT_COOLDOWN_MS,
  EVENT_LABELS,
  SCORE_PENALTIES,
  THRESHOLDS,
} from '@/constants/thresholds';
import type { DrivingEvent, DrivingEventType, SensorSnapshot, Vector3 } from '@/types/driving';
import { angleDeltaDegrees, headingDegrees, magnitude, variance } from '@/utils/math';

interface DetectorState {
  lastEventTime: Partial<Record<DrivingEventType, number>>;
  accelHistory: number[];
  magnitudeHistory: number[];
  prevAccel: Vector3 | null;
  prevHeading: number | null;
  steerStreak: number;
}

function createInitialState(): DetectorState {
  return {
    lastEventTime: {},
    accelHistory: [],
    magnitudeHistory: [],
    prevAccel: null,
    prevHeading: null,
    steerStreak: 0,
  };
}

function canEmit(state: DetectorState, type: DrivingEventType, now: number): boolean {
  const last = state.lastEventTime[type] ?? 0;
  return now - last >= EVENT_COOLDOWN_MS;
}

function createEvent(type: DrivingEventType, timestamp: number, eventMagnitude?: number): DrivingEvent {
  return {
    id: `${type}-${timestamp}`,
    type,
    timestamp,
    penalty: SCORE_PENALTIES[type],
    label: EVENT_LABELS[type],
    magnitude: eventMagnitude,
  };
}

function pushRolling(values: number[], value: number, size: number): number[] {
  const next = [...values, value];
  if (next.length > size) {
    next.shift();
  }
  return next;
}

function dominantAxisDelta(prev: Vector3, curr: Vector3): { axis: keyof Vector3; delta: number } {
  const deltas = {
    x: curr.x - prev.x,
    y: curr.y - prev.y,
    z: curr.z - prev.z,
  };

  const axis = (Object.keys(deltas) as (keyof Vector3)[]).reduce((best, key) =>
    Math.abs(deltas[key]) > Math.abs(deltas[best]) ? key : best,
  'y');

  return { axis, delta: deltas[axis] };
}

export class EventDetector {
  private state = createInitialState();

  reset(): void {
    this.state = createInitialState();
  }

  analyze(snapshot: SensorSnapshot, timestamp: number): DrivingEvent[] {
    const events: DrivingEvent[] = [];
    const { accelerometer, gyroscope, magnetometer, deviceMotion } = snapshot;

    const accel = deviceMotion?.acceleration ?? accelerometer;
    const rotation = deviceMotion?.rotationRate ?? gyroscope;
    const accelMag = magnitude(accel);
    const gyroMag = magnitude(rotation);

    this.state.magnitudeHistory = pushRolling(
      this.state.magnitudeHistory,
      accelMag,
      THRESHOLDS.VARIANCE_WINDOW,
    );
    this.state.accelHistory = pushRolling(
      this.state.accelHistory,
      accel.y,
      THRESHOLDS.VARIANCE_WINDOW,
    );

    if (this.state.prevAccel) {
      const { delta } = dominantAxisDelta(this.state.prevAccel, accel);

      if (delta <= -THRESHOLDS.HARSH_BRAKE_G && canEmit(this.state, 'harsh_braking', timestamp)) {
        events.push(createEvent('harsh_braking', timestamp, Math.abs(delta)));
        this.state.lastEventTime.harsh_braking = timestamp;
      }

      if (delta >= THRESHOLDS.HARSH_ACCEL_G && canEmit(this.state, 'harsh_acceleration', timestamp)) {
        events.push(createEvent('harsh_acceleration', timestamp, delta));
        this.state.lastEventTime.harsh_acceleration = timestamp;
      }
    }

    if (Math.abs(rotation.z) >= THRESHOLDS.SHARP_TURN_RAD_S && canEmit(this.state, 'sharp_turn', timestamp)) {
      events.push(createEvent('sharp_turn', timestamp, Math.abs(rotation.z)));
      this.state.lastEventTime.sharp_turn = timestamp;
    }

    const steerRate = Math.max(Math.abs(rotation.x), Math.abs(rotation.y));
    if (steerRate >= THRESHOLDS.AGGRESSIVE_STEER_RAD_S) {
      this.state.steerStreak += 1;
    } else {
      this.state.steerStreak = 0;
    }

    if (
      this.state.steerStreak >= 2 &&
      canEmit(this.state, 'aggressive_steering', timestamp)
    ) {
      events.push(createEvent('aggressive_steering', timestamp, steerRate));
      this.state.lastEventTime.aggressive_steering = timestamp;
      this.state.steerStreak = 0;
    }

    const gravityDeviation = Math.abs(accelMag - 1);
    if (
      gravityDeviation >= THRESHOLDS.EXCESSIVE_MOVEMENT_G &&
      canEmit(this.state, 'excessive_movement', timestamp)
    ) {
      events.push(createEvent('excessive_movement', timestamp, gravityDeviation));
      this.state.lastEventTime.excessive_movement = timestamp;
    }

    const accelVariance = variance(this.state.accelHistory);
    if (
      gyroMag >= THRESHOLDS.PHONE_HANDLING_GYRO &&
      accelVariance >= THRESHOLDS.PHONE_HANDLING_ACCEL_VAR &&
      canEmit(this.state, 'phone_handling', timestamp)
    ) {
      events.push(createEvent('phone_handling', timestamp, gyroMag));
      this.state.lastEventTime.phone_handling = timestamp;
    }

    if (magnetometer) {
      const heading = headingDegrees(magnetometer);
      if (this.state.prevHeading !== null) {
        const headingChange = angleDeltaDegrees(this.state.prevHeading, heading);
        if (
          headingChange >= THRESHOLDS.MAGNETOMETER_TURN_DEG &&
          canEmit(this.state, 'sharp_turn', timestamp) &&
          !events.some((event) => event.type === 'sharp_turn')
        ) {
          events.push(createEvent('sharp_turn', timestamp, headingChange));
          this.state.lastEventTime.sharp_turn = timestamp;
        }
      }
      this.state.prevHeading = heading;
    }

    this.state.prevAccel = accel;
    return events;
  }
}
