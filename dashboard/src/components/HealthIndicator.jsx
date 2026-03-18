import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { healthStyles } from '../utils/healthStyles.js';

const iconMap = {
  healthy: CheckCircle,
  degraded: AlertTriangle,
  down: XCircle,
};

const labelMap = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
};

/**
 * Colored dot + accessible Lucide icon for health status.
 *
 * @param {{ status: 'healthy'|'degraded'|'down' }} props
 */
export default function HealthIndicator({ status }) {
  const styles = healthStyles(status);
  const Icon = iconMap[status] || CheckCircle;
  const label = labelMap[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${styles.text}`}
      aria-label={`Status: ${label}`}
      role="img"
    >
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${styles.dot}`} aria-hidden="true" />
      <Icon size={16} aria-hidden="true" />
    </span>
  );
}
