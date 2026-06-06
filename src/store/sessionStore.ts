import type { DrivingSession } from '@/types/driving';

let lastSession: DrivingSession | null = null;

export function setLastSession(session: DrivingSession): void {
  lastSession = session;
}

export function getLastSession(): DrivingSession | null {
  return lastSession;
}

export function clearLastSession(): void {
  lastSession = null;
}
