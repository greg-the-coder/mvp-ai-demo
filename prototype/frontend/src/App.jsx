import React, { useState, useCallback } from "react";
import Header from "./components/Header";
import StatusGrid from "./components/StatusGrid";
import { mockData } from "./data/mockData";

export default function App() {
  const [data, setData] = useState(mockData);

  const handleRefresh = useCallback(() => {
    // Simulate data refresh by regenerating timestamps
    setData({
      ...mockData,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lastUpdated={data.updatedAt} onRefresh={handleRefresh} />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <StatusGrid services={data.services} />
      </main>
    </div>
  );
}
