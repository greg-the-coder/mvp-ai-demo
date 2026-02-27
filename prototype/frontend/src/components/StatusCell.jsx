import React from "react";
import HealthIndicator from "./HealthIndicator";
import DriftBadge from "./DriftBadge";
import { getHealthColors } from "../utils/healthColors";
import { formatRelativeTime } from "../utils/formatRelativeTime";

const StatusCell = React.memo(function StatusCell({ deployment, drift }) {
  const colors = getHealthColors(deployment.health);

  return (
    <td
      className={`px-4 py-3 border ${colors.border} ${colors.bg} transition-colors hover:brightness-95`}
    >
      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <div className="flex items-center gap-2">
          <HealthIndicator status={deployment.health} />
          <span className="font-mono text-sm font-semibold text-gray-900">
            {deployment.version}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {formatRelativeTime(deployment.deployedAt)}
        </span>
        <span className="text-xs text-gray-400">
          deployed by:{" "}
          <span className="text-gray-600">{deployment.deployedBy}</span>
        </span>
        {drift && drift > 0 && <DriftBadge versionsAhead={drift} />}
      </div>
    </td>
  );
});

export default StatusCell;
