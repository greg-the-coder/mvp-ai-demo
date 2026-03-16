import React from 'react';
import { RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '../utils';

export default function Header({ updatedAt, onRefresh, loading }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Environment Status Dashboard</h1>
        {updatedAt && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {formatRelativeTime(updatedAt)}
          </p>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </header>
  );
}
