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
          deployedAt: new Date(Date.now() - 1800000).toISOString(),
          deployedBy: "sarah.chen",
          health: "healthy",
        },
        staging: {
          version: "v2.7.1",
          deployedAt: new Date(Date.now() - 86400000).toISOString(),
          deployedBy: "mike.johnson",
          health: "healthy",
        },
        production: {
          version: "v2.6.0",
          deployedAt: new Date(Date.now() - 259200000).toISOString(),
          deployedBy: "sarah.chen",
          health: "healthy",
        },
      },
    },
    {
      id: "auth-service",
      name: "Auth Service",
      description: "Authentication and authorization",
      deployments: {
        development: {
          version: "v3.2.1",
          deployedAt: new Date(Date.now() - 7200000).toISOString(),
          deployedBy: "alex.kumar",
          health: "healthy",
        },
        staging: {
          version: "v3.2.0",
          deployedAt: new Date(Date.now() - 172800000).toISOString(),
          deployedBy: "alex.kumar",
          health: "degraded",
        },
        production: {
          version: "v3.1.0",
          deployedAt: new Date(Date.now() - 604800000).toISOString(),
          deployedBy: "jordan.lee",
          health: "healthy",
        },
      },
    },
    {
      id: "user-service",
      name: "User Service",
      description: "User management and profiles",
      deployments: {
        development: {
          version: "v1.15.0",
          deployedAt: new Date(Date.now() - 3600000).toISOString(),
          deployedBy: "emily.watson",
          health: "healthy",
        },
        staging: {
          version: "v1.14.2",
          deployedAt: new Date(Date.now() - 43200000).toISOString(),
          deployedBy: "emily.watson",
          health: "healthy",
        },
        production: {
          version: "v1.14.0",
          deployedAt: new Date(Date.now() - 432000000).toISOString(),
          deployedBy: "chris.martinez",
          health: "healthy",
        },
      },
    },
    {
      id: "payment-service",
      name: "Payment Service",
      description: "Payment processing and billing",
      deployments: {
        development: {
          version: "v4.1.0",
          deployedAt: new Date(Date.now() - 14400000).toISOString(),
          deployedBy: "david.park",
          health: "healthy",
        },
        staging: {
          version: "v4.0.2",
          deployedAt: new Date(Date.now() - 259200000).toISOString(),
          deployedBy: "david.park",
          health: "healthy",
        },
        production: {
          version: "v3.9.1",
          deployedAt: new Date(Date.now() - 864000000).toISOString(),
          deployedBy: "lisa.wong",
          health: "down",
        },
      },
    },
    {
      id: "notification-service",
      name: "Notification Service",
      description: "Email and SMS notifications",
      deployments: {
        development: {
          version: "v2.3.0",
          deployedAt: new Date(Date.now() - 900000).toISOString(),
          deployedBy: "rachel.kim",
          health: "healthy",
        },
        staging: {
          version: "v2.2.1",
          deployedAt: new Date(Date.now() - 129600000).toISOString(),
          deployedBy: "rachel.kim",
          health: "healthy",
        },
        production: {
          version: "v2.2.0",
          deployedAt: new Date(Date.now() - 345600000).toISOString(),
          deployedBy: "tom.anderson",
          health: "healthy",
        },
      },
    },
    {
      id: "search-service",
      name: "Search Service",
      description: "Full-text search and indexing",
      deployments: {
        development: {
          version: "v5.0.0-beta",
          deployedAt: new Date(Date.now() - 1800000).toISOString(),
          deployedBy: "nina.patel",
          health: "degraded",
        },
        staging: {
          version: "v4.8.0",
          deployedAt: new Date(Date.now() - 518400000).toISOString(),
          deployedBy: "nina.patel",
          health: "healthy",
        },
        production: {
          version: "v4.7.2",
          deployedAt: new Date(Date.now() - 1209600000).toISOString(),
          deployedBy: "james.taylor",
          health: "healthy",
        },
      },
    },
  ],
};
