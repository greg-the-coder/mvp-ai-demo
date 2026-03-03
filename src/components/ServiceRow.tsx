import type { Service, Environment } from '../types';
import { calculateDrift } from '../utils';
import StatusCell from './StatusCell';

interface ServiceRowProps {
  service: Service;
  environments: Environment[];
}

export default function ServiceRow({ service, environments }: ServiceRowProps) {
  const prodEnv = environments.find((e) => e.name === 'production');
  const prodVersion = prodEnv?.deployments[service.name]?.version;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-gray-200">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{service.label}</span>
          <span className="text-xs text-gray-400 font-mono">{service.name}</span>
        </div>
      </td>
      {environments.map((env) => {
        const deployment = env.deployments[service.name];
        if (!deployment) {
          return (
            <td key={env.name} className="px-4 py-3 text-xs text-gray-400 border-r border-gray-100 last:border-r-0">
              Not deployed
            </td>
          );
        }
        const drift = prodVersion ? calculateDrift(deployment.version, prodVersion) : undefined;
        return <StatusCell key={env.name} deployment={deployment} drift={env.name !== 'production' ? drift : undefined} />;
      })}
    </tr>
  );
}
