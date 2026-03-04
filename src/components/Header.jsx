import { RefreshCw } from "lucide-react";
import { formatRelativeTime } from "../utils/formatRelativeTime";

// Application header with title, last-updated time, and refresh button
export default function Header({ lastUpdated, onRefresh }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Coder Environment Status Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {formatRelativeTime(lastUpdated)}
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        aria-label="Refresh dashboard data"
      >
        <RefreshCw size={16} aria-hidden="true" />
        Refresh
      </button>
    </header>
  );
}
