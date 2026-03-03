import type { DriftInfo } from '../types';

interface DriftBadgeProps {
  drift: DriftInfo;
}

const severityStyles: Record<DriftInfo['severity'], string> = {
  none: '',
  minor: 'bg-blue-100 text-blue-800 border-blue-200',
  major: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const severityIcons: Record<DriftInfo['severity'], string> = {
  none: '',
  minor: '~',
  major: '!',
  critical: '!!',
};

export default function DriftBadge({ drift }: DriftBadgeProps) {
  if (!drift.hasDrift || drift.severity === 'none') return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${severityStyles[drift.severity]}`}
      title={`Drift: ${drift.sourceVersion} → ${drift.targetVersion}`}
      role="alert"
    >
      <span aria-hidden="true">{severityIcons[drift.severity]}</span>
      drift
    </span>
  );
}
