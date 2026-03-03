import type { Service, Environment } from '../types';
import ServiceRow from './ServiceRow';

interface StatusGridProps {
  services: Service[];
  environments: Environment[];
}

export default function StatusGrid({ services, environments }: StatusGridProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
              Service
            </th>
            {environments.map((env) => (
              <th
                key={env.name}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-100 last:border-r-0"
              >
                {env.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <ServiceRow key={service.name} service={service} environments={environments} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
