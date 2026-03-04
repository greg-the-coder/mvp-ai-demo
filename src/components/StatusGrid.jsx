import ServiceRow from "./ServiceRow";

const COLUMNS = ["Service", "Development", "Staging", "Production"];

// Renders the main grid table with column headers and service rows
export default function StatusGrid({ services }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full min-w-[1024px] border-collapse">
        <thead>
          <tr className="sticky top-0 z-10 bg-gray-100">
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-200"
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
