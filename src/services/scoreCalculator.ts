import { getSafetyRating, INITIAL_SCORE } from '@/constants/thresholds';
import type { DrivingEvent, EventCounts } from '@/types/driving';
import { EMPTY_EVENT_COUNTS } from '@/types/driving';

export function calculateScore(events: DrivingEvent[]): number {
  const totalPenalty = events.reduce((sum, event) => sum + event.penalty, 0);
  return Math.max(0, INITIAL_SCORE - totalPenalty);
}

export function buildEventCounts(events: DrivingEvent[]): EventCounts {
  const counts = { ...EMPTY_EVENT_COUNTS };
  for (const event of events) {
    counts[event.type] += 1;
  }
  return counts;
}

export function getTotalEvents(counts: EventCounts): number {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

export function buildSessionSummary(
  events: DrivingEvent[],
  startTime: number,
  endTime: number,
  sensorSamples: number,
) {
  const score = calculateScore(events);
  return {
    score,
    safetyRating: getSafetyRating(score),
    eventCounts: buildEventCounts(events),
    totalEvents: events.length,
    durationMs: endTime - startTime,
    sensorSamples,
  };
}
