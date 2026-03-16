import React from 'react';
import HealthIndicator from './HealthIndicator';
import DriftBadge from './DriftBadge';
import { formatRelativeTime, healthConfig } from '../utils';

const StatusCell = React.memo(function StatusCell({ deployment, driftWarning }) {
  const config = healthConfig[deployment.health];

  return (
    <td className={`px-4 py-3 ${config.bg} border ${config.border}`}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <HealthIndicator status={deployment.health} />
          <span className="text-sm font-mono font-semibold text-gray-800">{deployment.version}</span>
        </div>
        <div className="text-xs text-gray-500">
          {formatRelativeTime(deployment.deployedAt)}
        </div>
        <div className="text-xs text-gray-600">
          by {deployment.deployedBy}
        </div>
        {driftWarning && <DriftBadge message={driftWarning} />}
      </div>
    </td>
  );
});

export default StatusCell;
