import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatusGrid from './components/StatusGrid';
import { mockData } from './mockData';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/deployments');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ ...mockData, updatedAt: new Date().toISOString() });
      setError('API unreachable — showing mock data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        updatedAt={data?.updatedAt}
        onRefresh={fetchData}
        loading={loading}
      />
      <main className="p-6">
        {error && (
          <div className="mb-4 px-4 py-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg">
            {error}
          </div>
        )}
        {data ? (
          <StatusGrid services={data.services} />
        ) : (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        )}
      </main>
    </div>
  );
}
