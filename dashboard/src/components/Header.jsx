import { RefreshCw } from "lucide-react";
import { formatRelativeTime } from "../utils/formatRelativeTime";

export function Header({ lastUpdated, onRefresh }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Coder Environment Status Dashboard
          <span className="ml-3 text-sm font-normal text-blue-600">• Auto-deployed via CI/CD</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {formatRelativeTime(lastUpdated)}
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh
      </button>
    </header>
  );
}
