import { RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatRelativeTime.js';

/**
 * Dashboard header — title, last-updated timestamp, refresh button.
 *
 * @param {{ lastUpdated: string|null, onRefresh: () => void, loading: boolean }} props
 */
export default function Header({ lastUpdated, onRefresh, loading }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Environment Status Dashboard
        </h1>
        {lastUpdated && (
          <p className="mt-1 text-sm text-gray-500">
            Last updated: {formatRelativeTime(lastUpdated)}
          </p>
        )}
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Refresh deployment data"
      >
        <RefreshCw
          size={16}
          className={loading ? 'animate-spin' : ''}
          aria-hidden="true"
        />
        Refresh
      </button>
    </header>
  );
}
