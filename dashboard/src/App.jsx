import { useState, useMemo } from 'react';
import Header from './components/Header.jsx';
import FilterBar from './components/FilterBar.jsx';
import StatusGrid from './components/StatusGrid.jsx';
import { useDeployments } from './hooks/useDeployments.js';

// ---------------------------------------------------------------------------
// Embedded mock data (6 services from DATA_MODEL.md).
// Used as fallback when the backend API is unreachable.
// ---------------------------------------------------------------------------
function generateMockData() {
  return {
    updatedAt: new Date().toISOString(),
    services: [
      {
        id: 'api-gateway',
        name: 'API Gateway',
        description: 'Main API routing and rate limiting',
        deployments: {
          development: {
            version: 'v2.8.0',
            deployedAt: new Date(Date.now() - 1800000).toISOString(),
            deployedBy: 'sarah.chen',
            health: 'healthy',
          },
          staging: {
            version: 'v2.7.1',
            deployedAt: new Date(Date.now() - 86400000).toISOString(),
            deployedBy: 'mike.johnson',
            health: 'healthy',
          },
          production: {
            version: 'v2.6.0',
            deployedAt: new Date(Date.now() - 259200000).toISOString(),
            deployedBy: 'sarah.chen',
            health: 'healthy',
          },
        },
      },
      {
        id: 'auth-service',
        name: 'Auth Service',
        description: 'Authentication and authorization',
        deployments: {
          development: {
            version: 'v3.2.1',
            deployedAt: new Date(Date.now() - 7200000).toISOString(),
            deployedBy: 'alex.kumar',
            health: 'healthy',
          },
          staging: {
            version: 'v3.2.0',
            deployedAt: new Date(Date.now() - 172800000).toISOString(),
            deployedBy: 'alex.kumar',
            health: 'degraded',
          },
          production: {
            version: 'v3.1.0',
            deployedAt: new Date(Date.now() - 604800000).toISOString(),
            deployedBy: 'jordan.lee',
            health: 'healthy',
          },
        },
      },
      {
        id: 'user-service',
        name: 'User Service',
        description: 'User management and profiles',
        deployments: {
          development: {
            version: 'v1.15.0',
            deployedAt: new Date(Date.now() - 3600000).toISOString(),
            deployedBy: 'emily.watson',
            health: 'healthy',
          },
          staging: {
            version: 'v1.14.2',
            deployedAt: new Date(Date.now() - 43200000).toISOString(),
            deployedBy: 'emily.watson',
            health: 'healthy',
          },
          production: {
            version: 'v1.14.0',
            deployedAt: new Date(Date.now() - 432000000).toISOString(),
            deployedBy: 'chris.martinez',
            health: 'healthy',
          },
        },
      },
      {
        id: 'payment-service',
        name: 'Payment Service',
        description: 'Payment processing and billing',
        deployments: {
          development: {
            version: 'v4.1.0',
            deployedAt: new Date(Date.now() - 14400000).toISOString(),
            deployedBy: 'david.park',
            health: 'healthy',
          },
          staging: {
            version: 'v4.0.2',
            deployedAt: new Date(Date.now() - 259200000).toISOString(),
            deployedBy: 'david.park',
            health: 'healthy',
          },
          production: {
            version: 'v3.9.1',
            deployedAt: new Date(Date.now() - 864000000).toISOString(),
            deployedBy: 'lisa.wong',
            health: 'down',
          },
        },
      },
      {
        id: 'notification-service',
        name: 'Notification Service',
        description: 'Email and SMS notifications',
        deployments: {
          development: {
            version: 'v2.3.0',
            deployedAt: new Date(Date.now() - 900000).toISOString(),
            deployedBy: 'rachel.kim',
            health: 'healthy',
          },
          staging: {
            version: 'v2.2.1',
            deployedAt: new Date(Date.now() - 129600000).toISOString(),
            deployedBy: 'rachel.kim',
            health: 'healthy',
          },
          production: {
            version: 'v2.2.0',
            deployedAt: new Date(Date.now() - 345600000).toISOString(),
            deployedBy: 'tom.anderson',
            health: 'healthy',
          },
        },
      },
      {
        id: 'search-service',
        name: 'Search Service',
        description: 'Full-text search and indexing',
        deployments: {
          development: {
            version: 'v5.0.0-beta',
            deployedAt: new Date(Date.now() - 1800000).toISOString(),
            deployedBy: 'nina.patel',
            health: 'degraded',
          },
          staging: {
            version: 'v4.8.0',
            deployedAt: new Date(Date.now() - 518400000).toISOString(),
            deployedBy: 'nina.patel',
            health: 'healthy',
          },
          production: {
            version: 'v4.7.2',
            deployedAt: new Date(Date.now() - 1209600000).toISOString(),
            deployedBy: 'james.taylor',
            health: 'healthy',
          },
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// App — root component
// ---------------------------------------------------------------------------
export default function App() {
  const { services: apiServices, lastUpdated: apiLastUpdated, loading, error, refresh } = useDeployments();

  // Local filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');

  // Fall back to embedded mock data when the API is unreachable
  const mockData = useMemo(() => generateMockData(), []);
  const services = apiServices.length > 0 ? apiServices : (error ? mockData.services : apiServices);
  const lastUpdated = apiLastUpdated || (error ? mockData.updatedAt : null);

  // ---------- Filtering ----------
  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      // Name search (case-insensitive)
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const nameMatch = svc.name.toLowerCase().includes(q) || svc.id.toLowerCase().includes(q);
        if (!nameMatch) return false;
      }

      // Health filter — service passes if ANY of its environments match
      if (healthFilter !== 'all') {
        const envs = svc.deployments || {};
        const hasMatch = Object.values(envs).some((dep) => dep.health === healthFilter);
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [services, searchTerm, healthFilter]);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      {/* Header */}
      <Header lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} />

      {/* Filter bar */}
      <div className="mt-6 mb-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          healthFilter={healthFilter}
          onHealthFilterChange={setHealthFilter}
        />
      </div>

      {/* Error banner (still show grid with fallback data) */}
      {error && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <strong>Note:</strong> Could not reach the API ({error}). Showing demo data.
        </div>
      )}

      {/* Loading state */}
      {loading && services.length === 0 && (
        <div className="text-center py-20 text-gray-500">Loading deployments…</div>
      )}

      {/* Grid */}
      {(!loading || services.length > 0) && (
        <StatusGrid services={filteredServices} />
      )}
    </div>
  );
}
