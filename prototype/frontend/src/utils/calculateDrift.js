/**
 * Parses a semantic version string into components.
 * @param {string} versionString - e.g. "v2.4.1" or "v5.0.0-beta"
 * @returns {{ major: number, minor: number, patch: number } | null}
 */
function parseVersion(versionString) {
  const match = versionString.match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
    };
  }
  return null;
}

/**
 * Calculates the minor version difference between two version strings.
 * @param {string} version1 - The newer version
 * @param {string} version2 - The older version
 * @returns {number | null} Minor version difference, or null if non-semver
 */
function calculateVersionDrift(version1, version2) {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  if (!v1 || !v2) return null;
  // Use major*100+minor for threshold checks per spec
  return v1.major * 100 + v1.minor - (v2.major * 100 + v2.minor);
}

/**
 * Returns a human-friendly minor version count for display purposes.
 */
function displayDrift(version1, version2) {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  if (!v1 || !v2) return null;
  // Show combined major + minor distance for display
  const majorDiff = v1.major - v2.major;
  const minorDiff = v1.minor - v2.minor;
  return majorDiff + Math.abs(minorDiff);
}

/**
 * Determines drift warnings for a service across environments.
 * @param {string} devVersion
 * @param {string} stagingVersion
 * @param {string} prodVersion
 * @returns {{ stagingDrift: number|null, prodDrift: number|null, stagingWarning: boolean, prodWarning: boolean }}
 */
export function calculateDrift(devVersion, stagingVersion, prodVersion) {
  const stagingDrift = calculateVersionDrift(devVersion, stagingVersion);
  const prodDrift = calculateVersionDrift(stagingVersion, prodVersion);

  return {
    stagingDrift: displayDrift(devVersion, stagingVersion),
    prodDrift: displayDrift(stagingVersion, prodVersion),
    stagingWarning: stagingDrift !== null && stagingDrift > 2,
    prodWarning: prodDrift !== null && prodDrift > 1,
  };
}
