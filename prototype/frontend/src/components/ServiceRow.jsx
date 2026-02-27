import React from "react";
import StatusCell from "./StatusCell";
import { calculateDrift } from "../utils/calculateDrift";

const ServiceRow = React.memo(function ServiceRow({ service }) {
  const { development, staging, production } = service.deployments;
  const drift = calculateDrift(
    development.version,
    staging.version,
    production.version
  );

  return (
    <tr className="hover:bg-gray-50/50">
      <td className="px-4 py-3 border border-gray-200 bg-white sticky left-0 z-10">
        <div className="flex flex-col">
          <span className="font-medium text-sm text-gray-900">
            {service.name}
          </span>
          <span className="text-xs text-gray-400">{service.description}</span>
        </div>
      </td>
      <StatusCell deployment={development} drift={null} />
      <StatusCell
        deployment={staging}
        drift={drift.stagingWarning ? drift.stagingDrift : null}
      />
      <StatusCell
        deployment={production}
        drift={drift.prodWarning ? drift.prodDrift : null}
      />
    </tr>
  );
});

export default ServiceRow;
