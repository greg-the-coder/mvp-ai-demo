import { ServiceRow } from "./ServiceRow";

const COLUMNS = ["Service", "Development", "Staging", "Production"];

export function StatusGrid({ services }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 sticky top-0"
              >
                {col}
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
