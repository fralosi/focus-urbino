import Map from './components/Map';
import './App.css';

function App() {
  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header Moderno */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🎵</div>
            <div>
              <h1 className="text-2xl font-light tracking-wide">Focus Urbino</h1>
              <p className="text-xs text-gray-400 font-light">Study Community Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-emerald-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-300">2 online</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mappa Full-Screen */}
      <div className="h-screen w-screen">
        <Map />
      </div>
    </div>
  );
}

export default App;
