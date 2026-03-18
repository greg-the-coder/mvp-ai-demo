/**
 * Orange warning badge indicating version drift.
 *
 * @param {{ versionsAhead: number }} props
 */
export default function DriftBadge({ versionsAhead }) {
  if (!versionsAhead || versionsAhead <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 border border-orange-300 px-2 py-0.5 text-xs font-medium text-orange-800">
      ⚠ {versionsAhead} version{versionsAhead === 1 ? '' : 's'} behind
    </span>
  );
}
