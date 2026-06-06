import type { Vector3 } from '@/types/driving';

export function magnitude(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

export function headingDegrees(magnetometer: Vector3): number {
  return (Math.atan2(magnetometer.y, magnetometer.x) * 180) / Math.PI;
}

export function angleDeltaDegrees(from: number, to: number): number {
  let delta = to - from;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return Math.abs(delta);
}
