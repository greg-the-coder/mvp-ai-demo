import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatRelativeTime, calculateDrift, getHealthColor } from './index';

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for timestamps less than 60 seconds ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:30Z'));
    expect(formatRelativeTime('2025-06-15T12:00:00Z')).toBe('Just now');
  });

  it('returns "Just now" for future timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
    expect(formatRelativeTime('2025-06-15T12:05:00Z')).toBe('Just now');
  });

  it('returns "1 minute ago" for exactly 1 minute', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:01:00Z'));
    expect(formatRelativeTime('2025-06-15T12:00:00Z')).toBe('1 minute ago');
  });

  it('returns plural minutes for 2-59 minutes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:45:00Z'));
    expect(formatRelativeTime('2025-06-15T12:00:00Z')).toBe('45 minutes ago');
  });

  it('returns "1 hour ago" for exactly 1 hour', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T13:00:00Z'));
    expect(formatRelativeTime('2025-06-15T12:00:00Z')).toBe('1 hour ago');
  });

  it('returns plural hours for 2-23 hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T18:00:00Z'));
    expect(formatRelativeTime('2025-06-15T12:00:00Z')).toBe('6 hours ago');
  });

  it('returns "1 day ago" for exactly 1 day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-16T12:00:00Z'));
    expect(formatRelativeTime('2025-06-15T12:00:00Z')).toBe('1 day ago');
  });

  it('returns plural days for multiple days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-20T12:00:00Z'));
    expect(formatRelativeTime('2025-06-15T12:00:00Z')).toBe('5 days ago');
  });
});

describe('calculateDrift', () => {
  it('returns no drift for identical versions', () => {
    const result = calculateDrift('v1.2.3', 'v1.2.3');
    expect(result).toEqual({
      hasDrift: false,
      sourceVersion: 'v1.2.3',
      targetVersion: 'v1.2.3',
      severity: 'none',
    });
  });

  it('returns critical severity for major version differences', () => {
    const result = calculateDrift('v2.0.0', 'v1.0.0');
    expect(result.hasDrift).toBe(true);
    expect(result.severity).toBe('critical');
  });

  it('returns major severity for minor version differences', () => {
    const result = calculateDrift('v1.3.0', 'v1.2.0');
    expect(result.hasDrift).toBe(true);
    expect(result.severity).toBe('major');
  });

  it('returns minor severity for patch version differences', () => {
    const result = calculateDrift('v1.2.4', 'v1.2.3');
    expect(result.hasDrift).toBe(true);
    expect(result.severity).toBe('minor');
  });

  it('returns minor severity for prerelease differences', () => {
    const result = calculateDrift('v3.2.0-rc1', 'v3.2.0');
    expect(result.hasDrift).toBe(true);
    expect(result.severity).toBe('minor');
  });

  it('preserves source and target versions in result', () => {
    const result = calculateDrift('v2.4.1', 'v2.3.5');
    expect(result.sourceVersion).toBe('v2.4.1');
    expect(result.targetVersion).toBe('v2.3.5');
  });

  it('handles versions without v prefix', () => {
    const result = calculateDrift('2.0.0', '1.0.0');
    expect(result.hasDrift).toBe(true);
    expect(result.severity).toBe('critical');
  });
});

describe('getHealthColor', () => {
  it('returns green colors for healthy status', () => {
    const result = getHealthColor('healthy');
    expect(result.bg).toBe('bg-green-500');
    expect(result.text).toBe('text-green-700');
    expect(result.ring).toBe('ring-green-300');
  });

  it('returns yellow colors for degraded status', () => {
    const result = getHealthColor('degraded');
    expect(result.bg).toBe('bg-yellow-500');
    expect(result.text).toBe('text-yellow-700');
    expect(result.ring).toBe('ring-yellow-300');
  });

  it('returns red colors for down status', () => {
    const result = getHealthColor('down');
    expect(result.bg).toBe('bg-red-500');
    expect(result.text).toBe('text-red-700');
    expect(result.ring).toBe('ring-red-300');
  });

  it('returns gray colors for unknown status', () => {
    const result = getHealthColor('unknown');
    expect(result.bg).toBe('bg-gray-400');
    expect(result.text).toBe('text-gray-600');
    expect(result.ring).toBe('ring-gray-300');
  });
});
