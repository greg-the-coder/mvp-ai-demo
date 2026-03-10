import { memo } from "react";
import { HealthIndicator } from "./HealthIndicator";
import { DriftBadge } from "./DriftBadge";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import { getHealthStyles } from "../utils/healthColors";

export const StatusCell = memo(function StatusCell({ deployment, driftAmount }) {
  const styles = getHealthStyles(deployment.health);

  return (
    <td className={`px-4 py-3 border ${styles.border} ${styles.bg} transition-colors hover:brightness-95`}>
      <div className="space-y-1.5">
        <HealthIndicator status={deployment.health} />
        <div className="text-sm font-mono font-semibold text-gray-900">{deployment.version}</div>
        <div className="text-xs text-gray-500">{formatRelativeTime(deployment.deployedAt)}</div>
        <div className="text-xs text-gray-400">by {deployment.deployedBy}</div>
        {driftAmount > 0 && <DriftBadge versionsAhead={driftAmount} />}
      </div>
    </td>
  );
});
