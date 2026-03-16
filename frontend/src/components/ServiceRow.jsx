import React from 'react';
import StatusCell from './StatusCell';
import { calculateDrift } from '../utils';

export default function ServiceRow({ service, striped }) {
  const { development, staging, production } = service.deployments;
  const drift = calculateDrift(development.version, staging.version, production.version);

  return (
    <tr className={striped ? 'bg-gray-50' : 'bg-white'}>
      <td className="px-4 py-3 border border-gray-200">
        <div className="font-medium text-gray-900">{service.name}</div>
        <div className="text-xs text-gray-500">{service.description}</div>
      </td>
      <StatusCell deployment={development} driftWarning={null} />
      <StatusCell deployment={staging} driftWarning={drift.stagingWarning} />
      <StatusCell deployment={production} driftWarning={drift.prodWarning} />
    </tr>
  );
}
