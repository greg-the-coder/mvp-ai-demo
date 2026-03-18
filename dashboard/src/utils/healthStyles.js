/**
 * Maps a health status string to a set of Tailwind CSS classes.
 *
 * Color palette (from TECHNICAL_SPEC):
 *   healthy  → green-50/200/700
 *   degraded → yellow-50/200/700
 *   down     → red-50/200/700
 *
 * @param {'healthy'|'degraded'|'down'} status
 * @returns {{ bg: string, border: string, text: string, dot: string }}
 */
export function healthStyles(status) {
  switch (status) {
    case 'healthy':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        dot: 'bg-green-500',
      };
    case 'degraded':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        dot: 'bg-yellow-500',
      };
    case 'down':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        dot: 'bg-red-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        dot: 'bg-gray-500',
      };
  }
}
