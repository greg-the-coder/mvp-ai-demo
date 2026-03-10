import { memo } from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { getHealthStyles } from "../utils/healthColors";

const icons = {
  healthy: CheckCircle,
  degraded: AlertTriangle,
  down: XCircle,
};

export const HealthIndicator = memo(function HealthIndicator({ status }) {
  const styles = getHealthStyles(status);
  const Icon = icons[status] || CheckCircle;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${styles.dot}`} />
      <Icon className={`w-4 h-4 ${styles.text}`} />
      <span className={`text-sm font-medium capitalize ${styles.text}`}>{status}</span>
    </span>
  );
});
