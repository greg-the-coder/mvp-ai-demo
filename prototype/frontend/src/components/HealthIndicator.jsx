import React from "react";
import { getHealthColors } from "../utils/healthColors";

const HealthIndicator = React.memo(function HealthIndicator({ status }) {
  const colors = getHealthColors(status);

  return (
    <span
      className="inline-flex items-center gap-1.5"
      role="status"
      aria-label={`Health: ${colors.label}`}
    >
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${colors.dot}`}
        aria-hidden="true"
      />
      <span className={`text-xs font-medium ${colors.text}`} aria-hidden="true">
        {colors.icon}
      </span>
      <span className="sr-only">{colors.label}</span>
    </span>
  );
});

export default HealthIndicator;
