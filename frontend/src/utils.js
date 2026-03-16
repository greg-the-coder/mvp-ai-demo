export function formatRelativeTime(date) {
  const now = Date.now();
  const timestamp = new Date(date).getTime();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

export function parseVersion(versionString) {
  const match = versionString.match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3]),
    };
  }
  return null;
}

function calculateVersionDrift(version1, version2) {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  if (!v1 || !v2) return null;
  return (v1.major * 100 + v1.minor) - (v2.major * 100 + v2.minor);
}

export function calculateDrift(devVersion, stagingVersion, prodVersion) {
  const stagingDrift = calculateVersionDrift(devVersion, stagingVersion);
  const prodDrift = calculateVersionDrift(stagingVersion, prodVersion);

  return {
    stagingWarning: stagingDrift !== null && stagingDrift > 2
      ? `${stagingDrift} versions behind`
      : null,
    prodWarning: prodDrift !== null && prodDrift > 1
      ? `${prodDrift} versions behind`
      : null,
  };
}

export const healthConfig = {
  healthy: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Healthy',
  },
  degraded: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    label: 'Degraded',
  },
  down: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'Down',
  },
};
