import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DriftBadge({ message }) {
  if (!message) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 border border-orange-300 text-orange-800">
      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
      ⚠ {message}
    </span>
  );
}
