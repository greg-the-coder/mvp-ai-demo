import { memo } from "react";
import { StatusCell } from "./StatusCell";
import { shouldShowDriftWarning } from "../utils/calculateDrift";

export const ServiceRow = memo(function ServiceRow({ service }) {
  const { development, staging, production } = service.deployments;
  const drift = shouldShowDriftWarning(development.version, staging.version, production.version);

  return (
    <tr>
      <td className="px-4 py-3 border border-gray-200 bg-white">
        <div className="font-semibold text-gray-900">{service.name}</div>
        <div className="text-xs text-gray-400">{service.description}</div>
      </td>
      <StatusCell deployment={development} driftAmount={0} />
      <StatusCell deployment={staging} driftAmount={drift.stagingWarning ? drift.stagingDrift : 0} />
      <StatusCell deployment={production} driftAmount={drift.prodWarning ? drift.prodDrift : 0} />
    </tr>
  );
});
