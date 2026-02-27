/**
 * Returns Tailwind CSS classes for a given health status.
 * @param {'healthy' | 'degraded' | 'down'} status
 * @returns {{ bg: string, border: string, text: string, dot: string, icon: string, label: string }}
 */
export function getHealthColors(status) {
  switch (status) {
    case "healthy":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        dot: "bg-green-500",
        icon: "\u2713", // checkmark
        label: "Healthy",
      };
    case "degraded":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        dot: "bg-yellow-500",
        icon: "\u26A0", // warning
        label: "Degraded",
      };
    case "down":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        dot: "bg-red-500",
        icon: "\u2717", // x mark
        label: "Down",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        dot: "bg-gray-500",
        icon: "?",
        label: "Unknown",
      };
  }
}
