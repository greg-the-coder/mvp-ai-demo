import React from "react";
import ServiceRow from "./ServiceRow";

const ENVIRONMENTS = ["Service", "Development", "Staging", "Production"];

export default function StatusGrid({ services }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table
        className="w-full border-collapse"
        role="grid"
        aria-label="Service deployment status"
      >
        <thead>
          <tr className="bg-gray-100 sticky top-0 z-20">
            {ENVIRONMENTS.map((env) => (
              <th
                key={env}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200"
                scope="col"
              >
                {env}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
