import type { Deployment, DriftInfo } from '../types';
import { formatRelativeTime } from '../utils';
import HealthIndicator from './HealthIndicator';
import DriftBadge from './DriftBadge';

interface StatusCellProps {
  deployment: Deployment;
  drift?: DriftInfo;
}

export default function StatusCell({ deployment, drift }: StatusCellProps) {
  return (
    <td className="px-4 py-3 border-r border-gray-100 last:border-r-0">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gray-900">{deployment.version}</span>
          {drift && <DriftBadge drift={drift} />}
        </div>
        <HealthIndicator status={deployment.health} />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span title={new Date(deployment.timestamp).toLocaleString()}>
            {formatRelativeTime(deployment.timestamp)}
          </span>
          <span className="text-gray-300">·</span>
          <span>{deployment.deployer}</span>
        </div>
        {deployment.commitSha && (
          <span className="font-mono text-[10px] text-gray-400">{deployment.commitSha}</span>
        )}
      </div>
    </td>
  );
}
