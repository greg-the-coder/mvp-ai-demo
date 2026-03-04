import { memo } from "react";
import { User, Clock } from "lucide-react";
import HealthIndicator from "./HealthIndicator";
import DriftBadge from "./DriftBadge";
import { getHealthColor } from "../utils/healthColors";
import { formatRelativeTime } from "../utils/formatRelativeTime";

// Renders a single deployment cell with health, version, timestamp, deployer, and drift
const StatusCell = memo(function StatusCell({ deployment, driftAmount }) {
  const colors = getHealthColor(deployment.health);

  return (
    <td className={`p-3 border ${colors.border} ${colors.bg} transition-colors hover:brightness-95`}>
      <div className="flex flex-col gap-1.5">
        {/* Health + version */}
        <div className="flex items-center justify-between">
          <HealthIndicator status={deployment.health} />
          <span className="text-sm font-semibold text-gray-900">{deployment.version}</span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} aria-hidden="true" />
          <span>{formatRelativeTime(deployment.deployedAt)}</span>
        </div>

        {/* Deployer */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <User size={12} aria-hidden="true" />
          <span>{deployment.deployedBy}</span>
        </div>

        {/* Drift warning (conditional) */}
        {driftAmount > 0 && <DriftBadge versionsAhead={driftAmount} />}
      </div>
    </td>
  );
});

export default StatusCell;
