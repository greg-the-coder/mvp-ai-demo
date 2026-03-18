import StatusCell from './StatusCell.jsx';
import { calculateDrift } from '../utils/calculateDrift.js';

/**
 * A single row in the status grid — service name + 3 StatusCells.
 *
 * @param {{ service: object, className: string }} props
 */
export default function ServiceRow({ service, className = '' }) {
  const { name, deployments } = service;
  const dev = deployments?.development;
  const staging = deployments?.staging;
  const prod = deployments?.production;

  const drift = calculateDrift(
    dev?.version,
    staging?.version,
    prod?.version,
  );

  return (
    <tr className={`${className}`}>
      {/* Service name cell */}
      <td className="px-4 py-3 font-medium text-sm text-gray-900 whitespace-nowrap border-r border-gray-200">
        <div className="flex flex-col">
          <span>{name}</span>
          {service.description && (
            <span className="text-xs text-gray-400 font-normal">{service.description}</span>
          )}
        </div>
      </td>

      {/* Development */}
      <StatusCell deployment={dev} driftAmount={null} />

      {/* Staging — show drift badge when staging > 2 minor behind dev */}
      <StatusCell
        deployment={staging}
        driftAmount={drift.stagingWarning ? drift.stagingDrift : null}
      />

      {/* Production — show drift badge when prod > 1 minor behind staging */}
      <StatusCell
        deployment={prod}
        driftAmount={drift.prodWarning ? drift.prodDrift : null}
      />
    </tr>
  );
}
