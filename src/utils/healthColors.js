// Returns Tailwind CSS classes for each health status
const healthColorMap = {
  healthy: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  degraded: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  down: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

export function getHealthColor(status) {
  return healthColorMap[status] || healthColorMap.healthy;
}
