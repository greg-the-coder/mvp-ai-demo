# Data Model: Environment Status Dashboard

---

## Type Definitions

```typescript
type HealthStatus = 'healthy' | 'degraded' | 'down';

type Environment = 'development' | 'staging' | 'production';

interface DeploymentData {
  version: string;          // "v2.4.1" or "a3f2c1b"
  deployedAt: string;       // ISO 8601 timestamp
  deployedBy: string;       // Username or email
  health: HealthStatus;
}

interface ServiceData {
  id: string;               // Unique identifier
  name: string;             // Display name
  description: string;      // Short description
  deployments: {
    development: DeploymentData;
    staging: DeploymentData;
    production: DeploymentData;
  };
}

interface DashboardData {
  services: ServiceData[];
  updatedAt: string;        // ISO 8601 timestamp
}
```

---

## Mock Data

Use the following mock data for development and demonstration:

```javascript
export const mockData = {
  updatedAt: new Date().toISOString(),
  services: [
    {
      id: "api-gateway",
      name: "API Gateway",
      description: "Main API routing and rate limiting",
      deployments: {
        development: {
          version: "v2.8.0",
          deployedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
          deployedBy: "sarah.chen",
          health: "healthy"
        },
        staging: {
          version: "v2.7.1",
          deployedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          deployedBy: "mike.johnson",
          health: "healthy"
        },
        production: {
          version: "v2.6.0",
          deployedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          deployedBy: "sarah.chen",
          health: "healthy"
        }
      }
    },
    {
      id: "auth-service",
      name: "Auth Service",
      description: "Authentication and authorization",
      deployments: {
        development: {
          version: "v3.2.1",
          deployedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          deployedBy: "alex.kumar",
          health: "healthy"
        },
        staging: {
          version: "v3.2.0",
          deployedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          deployedBy: "alex.kumar",
          health: "degraded"
        },
        production: {
          version: "v3.1.0",
          deployedAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
          deployedBy: "jordan.lee",
          health: "healthy"
        }
      }
    },
    {
      id: "user-service",
      name: "User Service",
      description: "User management and profiles",
      deployments: {
        development: {
          version: "v1.15.0",
          deployedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          deployedBy: "emily.watson",
          health: "healthy"
        },
        staging: {
          version: "v1.14.2",
          deployedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          deployedBy: "emily.watson",
          health: "healthy"
        },
        production: {
          version: "v1.14.0",
          deployedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
          deployedBy: "chris.martinez",
          health: "healthy"
        }
      }
    },
    {
      id: "payment-service",
      name: "Payment Service",
      description: "Payment processing and billing",
      deployments: {
        development: {
          version: "v4.1.0",
          deployedAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
          deployedBy: "david.park",
          health: "healthy"
        },
        staging: {
          version: "v4.0.2",
          deployedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          deployedBy: "david.park",
          health: "healthy"
        },
        production: {
          version: "v3.9.1",
          deployedAt: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
          deployedBy: "lisa.wong",
          health: "down"
        }
      }
    },
    {
      id: "notification-service",
      name: "Notification Service",
      description: "Email and SMS notifications",
      deployments: {
        development: {
          version: "v2.3.0",
          deployedAt: new Date(Date.now() - 900000).toISOString(), // 15 min ago
          deployedBy: "rachel.kim",
          health: "healthy"
        },
        staging: {
          version: "v2.2.1",
          deployedAt: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
          deployedBy: "rachel.kim",
          health: "healthy"
        },
        production: {
          version: "v2.2.0",
          deployedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
          deployedBy: "tom.anderson",
          health: "healthy"
        }
      }
    },
    {
      id: "search-service",
      name: "Search Service",
      description: "Full-text search and indexing",
      deployments: {
        development: {
          version: "v5.0.0-beta",
          deployedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
          deployedBy: "nina.patel",
          health: "degraded"
        },
        staging: {
          version: "v4.8.0",
          deployedAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
          deployedBy: "nina.patel",
          health: "healthy"
        },
        production: {
          version: "v4.7.2",
          deployedAt: new Date(Date.now() - 1209600000).toISOString(), // 14 days ago
          deployedBy: "james.taylor",
          health: "healthy"
        }
      }
    }
  ]
};
```

---

## Data Scenarios

The mock data above is designed to demonstrate these scenarios:

| Service | Scenario Demonstrated |
|---------|----------------------|
| API Gateway | Normal progression, healthy across environments |
| Auth Service | Staging degraded, shows yellow status |
| User Service | Normal flow, no issues |
| Payment Service | Production DOWN, shows critical red status |
| Notification Service | Recently active development |
| Search Service | Development has beta version, dev is degraded |

### Version Drift Examples

- **Payment Service:** Prod (v3.9.1) significantly behind Dev (v4.1.0) - should trigger drift warning
- **Search Service:** Prod (v4.7.2) is 14 days old - age indicator

---

## Drift Calculation Logic

```javascript
function parseVersion(versionString) {
  // Handle "v2.4.1" format
  const match = versionString.match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3])
    };
  }
  // Handle commit SHA or beta versions
  return null;
}

function calculateVersionDrift(version1, version2) {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  
  if (!v1 || !v2) return null; // Can't compare non-semver
  
  // Calculate minor version difference
  const diff = (v1.major * 100 + v1.minor) - (v2.major * 100 + v2.minor);
  return diff;
}

function shouldShowDriftWarning(devVersion, stagingVersion, prodVersion) {
  const stagingDrift = calculateVersionDrift(devVersion, stagingVersion);
  const prodDrift = calculateVersionDrift(stagingVersion, prodVersion);
  
  return {
    stagingWarning: stagingDrift !== null && stagingDrift > 2,
    prodWarning: prodDrift !== null && prodDrift > 1
  };
}
```

---

## Health Status Rules

| Status | Visual | Meaning |
|--------|--------|---------|
| healthy | 🟢 Green | All health checks passing |
| degraded | 🟡 Yellow | Partial functionality, elevated errors |
| down | 🔴 Red | Service unavailable |
