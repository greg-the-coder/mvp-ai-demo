import type { DashboardData } from '../types';

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export const mockData: DashboardData = {
  lastUpdated: new Date().toISOString(),
  services: [
    { name: 'api-gateway', label: 'API Gateway', repository: 'org/api-gateway' },
    { name: 'user-service', label: 'User Service', repository: 'org/user-service' },
    { name: 'payment-service', label: 'Payment Service', repository: 'org/payment-service' },
    { name: 'notification-svc', label: 'Notification Service', repository: 'org/notification-svc' },
    { name: 'web-frontend', label: 'Web Frontend', repository: 'org/web-frontend' },
  ],
  environments: [
    {
      name: 'dev',
      label: 'Development',
      deployments: {
        'api-gateway': { version: 'v2.4.1', timestamp: minutesAgo(12), deployer: 'alice', health: 'healthy', commitSha: 'a1b2c3d' },
        'user-service': { version: 'v1.8.0', timestamp: minutesAgo(45), deployer: 'bob', health: 'healthy', commitSha: 'e4f5g6h' },
        'payment-service': { version: 'v3.2.0-rc1', timestamp: hoursAgo(2), deployer: 'charlie', health: 'degraded', commitSha: 'i7j8k9l' },
        'notification-svc': { version: 'v1.3.0', timestamp: minutesAgo(5), deployer: 'alice', health: 'healthy', commitSha: 'm0n1o2p' },
        'web-frontend': { version: 'v4.1.0', timestamp: minutesAgo(30), deployer: 'diana', health: 'healthy', commitSha: 'q3r4s5t' },
      },
    },
    {
      name: 'staging',
      label: 'Staging',
      deployments: {
        'api-gateway': { version: 'v2.4.0', timestamp: hoursAgo(6), deployer: 'bob', health: 'healthy', commitSha: 'u6v7w8x' },
        'user-service': { version: 'v1.7.2', timestamp: hoursAgo(12), deployer: 'alice', health: 'healthy', commitSha: 'y9z0a1b' },
        'payment-service': { version: 'v3.1.0', timestamp: daysAgo(1), deployer: 'charlie', health: 'healthy', commitSha: 'c2d3e4f' },
        'notification-svc': { version: 'v1.2.1', timestamp: hoursAgo(3), deployer: 'diana', health: 'down', commitSha: 'g5h6i7j' },
        'web-frontend': { version: 'v4.0.2', timestamp: hoursAgo(8), deployer: 'bob', health: 'healthy', commitSha: 'k8l9m0n' },
      },
    },
    {
      name: 'production',
      label: 'Production',
      deployments: {
        'api-gateway': { version: 'v2.3.5', timestamp: daysAgo(3), deployer: 'alice', health: 'healthy', commitSha: 'o1p2q3r' },
        'user-service': { version: 'v1.7.2', timestamp: daysAgo(5), deployer: 'bob', health: 'healthy', commitSha: 'y9z0a1b' },
        'payment-service': { version: 'v3.0.2', timestamp: daysAgo(7), deployer: 'charlie', health: 'healthy', commitSha: 's4t5u6v' },
        'notification-svc': { version: 'v1.2.0', timestamp: daysAgo(4), deployer: 'diana', health: 'healthy', commitSha: 'w7x8y9z' },
        'web-frontend': { version: 'v3.9.1', timestamp: daysAgo(10), deployer: 'alice', health: 'degraded', commitSha: 'a0b1c2d' },
      },
    },
  ],
};
