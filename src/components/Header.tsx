import { formatRelativeTime } from '../utils';

interface HeaderProps {
  lastUpdated: string;
}

export default function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Environment Status Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor deployments across all environments</p>
      </div>
      <div className="text-right">
        <span className="text-xs text-gray-400">Last updated</span>
        <p className="text-sm font-medium text-gray-600" title={new Date(lastUpdated).toLocaleString()}>
          {formatRelativeTime(lastUpdated)}
        </p>
      </div>
    </header>
  );
}
