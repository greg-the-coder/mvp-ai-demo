/**
 * Converts an ISO 8601 string to a human-readable relative timestamp.
 *
 * - < 1 min  → "Just now"
 * - < 60 min → "X minutes ago"
 * - < 24 hr  → "X hours ago"
 * - >= 24 hr → "X days ago"
 *
 * @param {string} isoString — ISO 8601 date string
 * @returns {string} Relative time description
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';

  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'Just now';

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
