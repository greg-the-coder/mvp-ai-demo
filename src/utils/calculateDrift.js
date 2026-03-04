// Parses semver strings like "v2.4.1" into { major, minor, patch }
function parseVersion(versionString) {
  const match = versionString.match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3]),
    };
  }
  return null; // Can't parse non-semver (e.g. commit SHA, beta tags)
}

// Returns the minor-version difference between two version strings
function calculateVersionDrift(version1, version2) {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  if (!v1 || !v2) return null;
  return (v1.major * 100 + v1.minor) - (v2.major * 100 + v2.minor);
}

// Determines if drift thresholds are exceeded between environments
// stagingWarning: staging > 2 minor versions behind dev
// prodWarning: prod > 1 minor version behind staging
export function calculateDrift(devVersion, stagingVersion, prodVersion) {
  const stagingDrift = calculateVersionDrift(devVersion, stagingVersion);
  const prodDrift = calculateVersionDrift(stagingVersion, prodVersion);

  return {
    stagingDrift,
    prodDrift,
    stagingWarning: stagingDrift !== null && stagingDrift > 2,
    prodWarning: prodDrift !== null && prodDrift > 1,
  };
}
