import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { healthConfig } from '../utils';

const iconMap = {
  healthy: CheckCircle,
  degraded: AlertTriangle,
  down: XCircle,
};

export default function HealthIndicator({ status }) {
  const config = healthConfig[status];
  const Icon = iconMap[status];

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.text}`}>
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="sr-only">{config.label}</span>
    </span>
  );
}
