import { Search } from 'lucide-react';

/**
 * Filter bar — search by service name + dropdown for health status.
 *
 * @param {{ searchTerm: string, onSearchChange: (v: string) => void, healthFilter: string, onHealthFilterChange: (v: string) => void }} props
 */
export default function FilterBar({
  searchTerm,
  onSearchChange,
  healthFilter,
  onHealthFilterChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search services…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
          aria-label="Search services by name"
        />
      </div>

      {/* Health status filter */}
      <select
        value={healthFilter}
        onChange={(e) => onHealthFilterChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        aria-label="Filter by health status"
      >
        <option value="all">All Statuses</option>
        <option value="healthy">Healthy</option>
        <option value="degraded">Degraded</option>
        <option value="down">Down</option>
      </select>
    </div>
  );
}
