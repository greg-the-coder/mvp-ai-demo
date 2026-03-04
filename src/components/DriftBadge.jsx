import { memo } from "react";
import { AlertTriangle } from "lucide-react";

// Displays a warning badge when version drift exceeds thresholds
const DriftBadge = memo(function DriftBadge({ versionsAhead }) {
  if (!versionsAhead || versionsAhead <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 border border-orange-300 px-2 py-0.5 text-xs font-medium text-orange-800">
      <AlertTriangle size={12} aria-hidden="true" />
      {versionsAhead} version{versionsAhead === 1 ? "" : "s"} behind
    </span>
  );
});

export default DriftBadge;
