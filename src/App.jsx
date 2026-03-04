import { useState, useCallback } from "react";
import Header from "./components/Header";
import StatusGrid from "./components/StatusGrid";
import { mockData } from "./data/mockData";

// Root component — loads mock data and provides it to the dashboard
export default function App() {
  const [services, setServices] = useState(mockData.services);
  const [lastUpdated, setLastUpdated] = useState(mockData.updatedAt);

  // Simulate a data refresh by regenerating timestamps
  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date().toISOString());
    setServices([...mockData.services]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <Header lastUpdated={lastUpdated} onRefresh={handleRefresh} />
        <StatusGrid services={services} />
      </div>
    </div>
  );
}
