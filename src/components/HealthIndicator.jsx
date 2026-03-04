import { memo } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { getHealthColor } from "../utils/healthColors";

// Displays health status as a colored dot + accessible icon
const HealthIndicator = memo(function HealthIndicator({ status }) {
  const colors = getHealthColor(status);

  const iconProps = { size: 14, className: colors.text, "aria-hidden": "true" };
  const icons = {
    healthy: <CheckCircle2 {...iconProps} />,
    degraded: <AlertTriangle {...iconProps} />,
    down: <XCircle {...iconProps} />,
  };

  const labels = {
    healthy: "Healthy",
    degraded: "Degraded",
    down: "Down",
  };

  return (
    <span className="inline-flex items-center gap-1.5" role="status" aria-label={labels[status]}>
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors.dot}`} />
      {icons[status]}
      <span className={`text-xs font-medium ${colors.text}`}>{labels[status]}</span>
    </span>
  );
});

export default HealthIndicator;
