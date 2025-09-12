import Map from './components/Map';
import './App.css';

function App() {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎵</div>
            <h1 className="text-xl font-bold text-gray-800">Focus Urbino</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-600">2 utenti online</span>
          </div>
        </div>
      </header>
      
      {/* Mappa Full-Screen con altezza calcolata */}
      <div className="flex-1 h-full" style={{ height: 'calc(100vh - 80px)' }}>
        <Map />
      </div>
    </div>
  );
}

export default App;
