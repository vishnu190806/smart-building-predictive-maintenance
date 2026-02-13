import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import '../../styles/theme.css';

interface HeaderProps {
  pageTitle: string;
  onNavigate?: (page: string) => void;
}

export const Header = ({ pageTitle, onNavigate }: HeaderProps) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [theme, setTheme] = React.useState('dark'); // Default to Aurora (dark)
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResult, setSearchResult] = React.useState<any>(null); // For "Quick Look" modal

  // Simulated Notifications
  const notifications = [
    { id: 1, title: 'HVAC Alert', msg: 'Unit 3 compressor load high', time: '2m ago', type: 'critical' },
    { id: 2, title: 'System Update', msg: 'Patch 2.4 installed', time: '1h ago', type: 'info' },
    { id: 3, title: 'Access Control', msg: 'Unauthorized entry attempt', time: '4h ago', type: 'warning' },
  ];

  // Mock Database for Search
  const systemDb: Record<string, any> = {
    'hvac': { name: 'HVAC Unit 3', status: 'Warning', temp: '42°C', load: '89%', location: 'Roof Block A' },
    'elevator': { name: 'Elevator Bank B', status: 'Online', temp: '24°C', load: '12%', location: 'Lobby' },
    'server': { name: 'Main Server Cluster', status: 'Online', temp: '18°C', load: '45%', location: 'B1 Secure Zone' },
    'pump': { name: 'Water Pump Station', status: 'Critical', temp: '55°C', load: '98%', location: 'Basement' }
  };

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/');
        if (res.ok) setIsConnected(true);
        else setIsConnected(false);
      } catch (e) {
        setIsConnected(false);
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 10000); 
    return () => clearInterval(interval);
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Search Handler
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.toLowerCase();
      let found = false;
      
      // Check for keywords in mock DB
      for (const key in systemDb) {
        // Search by key (e.g. 'hvac') OR by descriptive name (e.g. 'Water Pump')
        if (q.includes(key) || systemDb[key].name.toLowerCase().includes(q)) {
            setSearchResult(systemDb[key]);
            found = true;
            break;
        }
      }

      if (!found) {
        if (q.includes('report')) {
            alert("Quick Nav: Jumped to Reports Page"); 
            if (onNavigate) onNavigate('reports');
        } else if (q.includes('access')) {
            alert("Quick Nav: Jumped to Access Control"); 
            if (onNavigate) onNavigate('access');
        } else alert(`No specific system found for "${searchQuery}". Try "HVAC", "Server", or "Pump".`);
      }
      setSearchQuery('');
    }
  };

  const handleViewTelemetry = () => {
    // Navigate to Energy Monitor as the detailed view
    if (onNavigate) onNavigate('energy');
    else window.location.hash = '#/energy'; // Fallback
    
    setSearchResult(null);
  };

  return (
    <>
      <header className="h-20 px-8 flex items-center justify-between border-b border-[var(--glass-border)] bg-[var(--bg-deep)]/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-wide transition-colors">{pageTitle}</h2>
        </div>

        <div className="flex items-center gap-6">
          {/* Connection Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
            isConnected ? 'bg-[rgba(16,185,129,0.1)] border-[var(--color-success)] text-[var(--color-success)]' : 'bg-[rgba(239,68,68,0.1)] border-[var(--color-danger)] text-[var(--color-danger)]'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--color-success)] animate-pulse' : 'bg-[var(--color-danger)]'}`}></div>
            <span className="uppercase tracking-wider">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search (e.g., 'HVAC', 'Pump')..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full py-2 px-4 pl-10 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--color-primary)] w-64 transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-[var(--text-muted)] w-4 h-4" />
          </div>

          {/* Notifications */}
          <div className="relative">
              <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-[var(--glass-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  title="Notifications"
              >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse"></span>
              </button>
              
              {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-[var(--bg-panel)] border border-[var(--glass-border)] rounded-xl shadow-2xl p-4 z-50 backdrop-blur-xl">
                      <h3 className="text-[var(--text-main)] font-bold mb-3 border-b border-[var(--glass-border)] pb-2">Recent Alerts</h3>
                      <div className="space-y-3">
                          {notifications.map(n => (
                              <div key={n.id} className="flex gap-3 items-start p-2 rounded hover:bg-[var(--glass-bg)] cursor-pointer">
                                  <div className={`w-2 h-2 mt-2 rounded-full ${n.type === 'critical' ? 'bg-red-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                  <div>
                                      <p className="text-sm font-semibold text-[var(--text-main)]">{n.title}</p>
                                      <p className="text-xs text-[var(--text-muted)]">{n.msg}</p>
                                      <p className="text-[10px] text-[var(--text-dim)] mt-1">{n.time}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--glass-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} className="text-[var(--color-primary)]" />} 
        </button>
        </div>
      </header>

      {/* Quick Look Search Result Modal */}
      {searchResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSearchResult(null)}>
            <div className="bg-[var(--bg-panel)] border border-[var(--glass-border)] p-6 rounded-2xl w-96 shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[var(--text-main)]">{searchResult.name}</h3>
                    <button onClick={() => setSearchResult(null)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">✕</button>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--glass-bg)]">
                        <span className="text-sm text-[var(--text-muted)]">Status</span>
                        <span className={`text-sm font-bold px-2 py-1 rounded ${
                            searchResult.status === 'Online' ? 'bg-green-500/20 text-green-500' : 
                            searchResult.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                        }`}>{searchResult.status}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-[var(--glass-bg)]">
                            <p className="text-xs text-[var(--text-muted)]">Temperature</p>
                            <p className="text-lg font-mono text-[var(--text-main)]">{searchResult.temp}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--glass-bg)]">
                            <p className="text-xs text-[var(--text-muted)]">Current Load</p>
                            <p className="text-lg font-mono text-[var(--text-main)]">{searchResult.load}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--glass-border)]">
                        <p className="text-xs text-[var(--text-dim)] flex items-center gap-2">
                             📍 Located in {searchResult.location}
                        </p>
                    </div>

                    <button 
                        onClick={handleViewTelemetry}
                        className="w-full py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:opacity-90 transition p-ripple"
                    >
                        View Full Telemetry
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};
