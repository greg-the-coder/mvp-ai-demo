import { mockData } from './data/mockData';
import Header from './components/Header';
import StatusGrid from './components/StatusGrid';

export default function App() {
  const { services, environments, lastUpdated } = mockData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header lastUpdated={lastUpdated} />
        <div className="mt-6">
          <StatusGrid services={services} environments={environments} />
        </div>
      </div>
    </div>
  );
}
