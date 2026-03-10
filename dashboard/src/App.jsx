import { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { StatusGrid } from "./components/StatusGrid";
import { mockData } from "./data/mockData";

function generateFreshData() {
  return {
    ...mockData,
    updatedAt: new Date().toISOString(),
    services: mockData.services.map((s) => ({
      ...s,
      deployments: Object.fromEntries(
        Object.entries(s.deployments).map(([env, dep]) => [
          env,
          { ...dep, deployedAt: dep.deployedAt },
        ])
      ),
    })),
  };
}

function App() {
  const [data, setData] = useState(generateFreshData);

  const handleRefresh = useCallback(() => {
    setData(generateFreshData());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <Header lastUpdated={data.updatedAt} onRefresh={handleRefresh} />
        <StatusGrid services={data.services} />
      </div>
    </div>
  );
}

export default App;
