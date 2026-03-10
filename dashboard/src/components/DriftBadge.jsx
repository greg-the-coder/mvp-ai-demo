import { memo } from "react";
import { AlertTriangle } from "lucide-react";

export const DriftBadge = memo(function DriftBadge({ versionsAhead }) {
  if (!versionsAhead || versionsAhead <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 border border-orange-300 text-orange-800">
      <AlertTriangle className="w-3 h-3" />
      {versionsAhead} version{versionsAhead !== 1 ? "s" : ""} behind
    </span>
  );
});
