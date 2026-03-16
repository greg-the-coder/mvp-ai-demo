import React from 'react';
import ServiceRow from './ServiceRow';

export default function StatusGrid({ services }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1280px] border-collapse">
        <thead>
          <tr className="sticky top-0 z-10 bg-gray-800 text-white">
            <th className="px-4 py-3 text-left font-semibold text-sm w-64">Service</th>
            <th className="px-4 py-3 text-left font-semibold text-sm">Development</th>
            <th className="px-4 py-3 text-left font-semibold text-sm">Staging</th>
            <th className="px-4 py-3 text-left font-semibold text-sm">Production</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, i) => (
            <ServiceRow key={service.id} service={service} striped={i % 2 === 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
