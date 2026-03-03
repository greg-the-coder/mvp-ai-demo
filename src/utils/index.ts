import type { DriftInfo, HealthStatus } from '../types';

/**
 * Formats a timestamp into a human-readable relative time string.
 */
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/**
 * Parses a semver-like version string into comparable parts.
 */
function parseVersion(version: string): { major: number; minor: number; patch: number; prerelease: string } {
  const cleaned = version.replace(/^v/, '');
  const [core, prerelease = ''] = cleaned.split('-');
  const [major = 0, minor = 0, patch = 0] = core.split('.').map(Number);
  return { major, minor, patch, prerelease };
}

/**
 * Compares two version strings and returns drift information.
 */
export function calculateDrift(sourceVersion: string, targetVersion: string): DriftInfo {
  if (sourceVersion === targetVersion) {
    return { hasDrift: false, sourceVersion, targetVersion, severity: 'none' };
  }

  const source = parseVersion(sourceVersion);
  const target = parseVersion(targetVersion);

  let severity: DriftInfo['severity'] = 'minor';
  if (source.major !== target.major) {
    severity = 'critical';
  } else if (source.minor !== target.minor) {
    severity = 'major';
  } else if (source.patch !== target.patch || source.prerelease !== target.prerelease) {
    severity = 'minor';
  }

  return { hasDrift: true, sourceVersion, targetVersion, severity };
}

/**
 * Maps a health status to a Tailwind color class.
 */
export function getHealthColor(status: HealthStatus): { bg: string; text: string; ring: string } {
  switch (status) {
    case 'healthy':
      return { bg: 'bg-green-500', text: 'text-green-700', ring: 'ring-green-300' };
    case 'degraded':
      return { bg: 'bg-yellow-500', text: 'text-yellow-700', ring: 'ring-yellow-300' };
    case 'down':
      return { bg: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-300' };
    default:
      return { bg: 'bg-gray-400', text: 'text-gray-600', ring: 'ring-gray-300' };
  }
}
