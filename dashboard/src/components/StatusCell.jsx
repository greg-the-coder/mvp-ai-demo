import React from 'react';
import HealthIndicator from './HealthIndicator.jsx';
import DriftBadge from './DriftBadge.jsx';
import { healthStyles } from '../utils/healthStyles.js';
import { formatRelativeTime } from '../utils/formatRelativeTime.js';

/**
 * Single deployment cell in the status grid.
 * Wrapped in React.memo to prevent unnecessary re-renders.
 *
 * @param {{ deployment: object, driftAmount: number|null }} props
 */
const StatusCell = React.memo(function StatusCell({ deployment, driftAmount }) {
  if (!deployment) {
    return <td className="px-4 py-3 text-sm text-gray-400 italic">No data</td>;
  }

  const { version, deployedAt, deployedBy, health } = deployment;
  const styles = healthStyles(health);

  return (
    <td
      className={`px-4 py-3 ${styles.bg} ${styles.border} border-l transition-colors duration-150 hover:brightness-95`}
    >
      <div className="flex flex-col gap-1">
        {/* Row 1: health indicator + version */}
        <div className="flex items-center gap-2">
          <HealthIndicator status={health} />
          <span className="font-bold text-sm text-gray-900">{version}</span>
        </div>

        {/* Row 2: relative timestamp */}
        <span className="text-xs text-gray-500">{formatRelativeTime(deployedAt)}</span>

        {/* Row 3: deployer */}
        <span className="text-xs text-gray-400">{deployedBy}</span>

        {/* Row 4: drift badge (conditional) */}
        {driftAmount != null && driftAmount > 0 && (
          <div className="mt-0.5">
            <DriftBadge versionsAhead={driftAmount} />
          </div>
        )}
      </div>
    </td>
  );
});

export default StatusCell;
