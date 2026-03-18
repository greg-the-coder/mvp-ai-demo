import ServiceRow from './ServiceRow.jsx';

/**
 * Grid / table showing all services × environments.
 * Sticky header, alternating row backgrounds.
 *
 * @param {{ services: Array }} props
 */
export default function StatusGrid({ services }) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        No services to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full table-fixed border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-50 border-b border-gray-200">
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 w-[22%]"
            >
              Service
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 w-[26%]"
            >
              Development
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 w-[26%]"
            >
              Staging
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 w-[26%]"
            >
              Production
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, index) => (
            <ServiceRow
              key={service.id}
              service={service}
              className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
