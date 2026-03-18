/**
 * Parse a semver-ish version string into { major, minor, patch }.
 * Handles "v2.4.1", "2.4.1", "v1.15.0", etc.
 * Returns null for non-semver strings (SHAs, beta tags like "v5.0.0-beta").
 *
 * @param {string} versionString
 * @returns {{ major: number, minor: number, patch: number } | null}
 */
function parseVersion(versionString) {
  if (!versionString) return null;
  // Only match clean semver — must be the whole string (optional leading v)
  const match = versionString.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Compute the "minor-version distance" between two version strings.
 * A distance of 1 means the higher version has 1 more minor bump.
 * Returns null when either version is not parseable.
 *
 * @param {string} higherVersion
 * @param {string} lowerVersion
 * @returns {number | null}
 */
function versionDistance(higherVersion, lowerVersion) {
  const v1 = parseVersion(higherVersion);
  const v2 = parseVersion(lowerVersion);
  if (!v1 || !v2) return null;
  return (v1.major * 100 + v1.minor) - (v2.major * 100 + v2.minor);
}

/**
 * Calculate version drift across environments and decide whether to show warnings.
 *
 * Rules (per FR-4):
 *  • stagingWarning  — staging > 2 minor versions behind dev
 *  • prodWarning     — prod > 1 minor version behind staging
 *
 * @param {string} devVersion
 * @param {string} stagingVersion
 * @param {string} prodVersion
 * @returns {{ stagingDrift: number|null, prodDrift: number|null, stagingWarning: boolean, prodWarning: boolean }}
 */
export function calculateDrift(devVersion, stagingVersion, prodVersion) {
  const stagingDrift = versionDistance(devVersion, stagingVersion);
  const prodDrift = versionDistance(stagingVersion, prodVersion);

  return {
    stagingDrift,
    prodDrift,
    stagingWarning: stagingDrift !== null && stagingDrift > 2,
    prodWarning: prodDrift !== null && prodDrift > 1,
  };
}
