import React from "react";

const DriftBadge = React.memo(function DriftBadge({ versionsAhead }) {
  if (!versionsAhead || versionsAhead <= 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 border border-orange-300 text-orange-800"
      role="alert"
      aria-label={`Warning: ${versionsAhead} versions behind`}
    >
      <span aria-hidden="true">{"\u26A0"}</span>
      {versionsAhead} {versionsAhead === 1 ? "version" : "versions"} behind
    </span>
  );
});

export default DriftBadge;
