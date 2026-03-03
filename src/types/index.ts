export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface Deployment {
  version: string;
  timestamp: string;
  deployer: string;
  health: HealthStatus;
  commitSha?: string;
}

export interface Environment {
  name: string;
  label: string;
  deployments: Record<string, Deployment>;
}

export interface Service {
  name: string;
  label: string;
  repository?: string;
}

export interface DashboardData {
  services: Service[];
  environments: Environment[];
  lastUpdated: string;
}

export interface DriftInfo {
  hasDrift: boolean;
  sourceVersion: string;
  targetVersion: string;
  severity: 'none' | 'minor' | 'major' | 'critical';
}
