import { intervalToDuration } from "date-fns";

export function DatesToDurationString(
  end: Date | null | undefined,
  start: Date | null | undefined
) {
  if (!end || !start) return null;

  const timeElapsed = end.getTime() - start.getTime();
  if (timeElapsed < 1000) {
    // Less than a second
    return `${timeElapsed}ms`;
  }

  const duration = intervalToDuration({
    start: 0,
    end: timeElapsed,
  });

  return `${duration.minutes || 0}m ${duration.seconds || 0}s`;
}
