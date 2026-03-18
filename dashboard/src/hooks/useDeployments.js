import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, POLL_INTERVAL } from '../config.js';

/**
 * Custom hook that fetches deployment data from the API and auto-polls.
 *
 * @param {number} [pollInterval=POLL_INTERVAL] — ms between refreshes
 * @returns {{ services: Array, lastUpdated: string|null, loading: boolean, error: string|null, refresh: () => void }}
 */
export function useDeployments(pollInterval = POLL_INTERVAL) {
  const [state, setState] = useState({
    services: [],
    lastUpdated: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/deployments`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState({
        services: data.services,
        lastUpdated: data.updatedAt,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return { ...state, refresh: fetchData };
}
