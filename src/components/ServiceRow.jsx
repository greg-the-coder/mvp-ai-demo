import StatusCell from "./StatusCell";
import { calculateDrift } from "../utils/calculateDrift";

// Renders a row for a single service across all environments
export default function ServiceRow({ service }) {
  const { development, staging, production } = service.deployments;

  // Calculate drift between adjacent environments
  const drift = calculateDrift(development.version, staging.version, production.version);

  return (
    <tr className="hover:bg-gray-50/50">
      {/* Service name */}
      <td className="p-3 border border-gray-200 bg-white">
        <div className="font-medium text-gray-900">{service.name}</div>
        <div className="text-xs text-gray-500">{service.description}</div>
      </td>

      <StatusCell deployment={development} driftAmount={0} />
      <StatusCell deployment={staging} driftAmount={drift.stagingWarning ? drift.stagingDrift : 0} />
      <StatusCell deployment={production} driftAmount={drift.prodWarning ? drift.prodDrift : 0} />
    </tr>
  );
}
