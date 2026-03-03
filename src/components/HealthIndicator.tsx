import type { HealthStatus } from '../types';
import { getHealthColor } from '../utils';

interface HealthIndicatorProps {
  status: HealthStatus;
}

const statusLabels: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
  unknown: 'Unknown',
};

export default function HealthIndicator({ status }: HealthIndicatorProps) {
  const colors = getHealthColor(status);
  const label = statusLabels[status];

  return (
    <span className="inline-flex items-center gap-1.5" role="status" aria-label={`Health: ${label}`}>
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${colors.bg} ${colors.ring} ring-2`}
        aria-hidden="true"
      />
      <span className={`text-xs font-medium ${colors.text}`}>{label}</span>
    </span>
  );
}
