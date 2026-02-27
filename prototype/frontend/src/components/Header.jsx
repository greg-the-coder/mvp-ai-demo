import React from "react";
import { formatRelativeTime } from "../utils/formatRelativeTime";

export default function Header({ lastUpdated, onRefresh }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          Coder Environment Status Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Last updated:{" "}
          <time dateTime={lastUpdated} className="font-medium text-gray-700">
            {formatRelativeTime(lastUpdated)}
          </time>
        </span>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          aria-label="Refresh deployment data"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
    </header>
  );
}
