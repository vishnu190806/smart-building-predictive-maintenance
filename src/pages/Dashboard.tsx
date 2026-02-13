import React from 'react';
import { Header } from '../components/layout/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { StatMetric } from '../components/ui/StatMetric';
import { Activity, Zap, Users, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [stats, setStats] = React.useState({
    health: { value: "...", trend: "...", trendUp: true },
    energy: { value: "...", trend: "...", trendUp: false },
    occupants: { value: "...", trend: "...", trendUp: true },
    alerts: { value: "...", trend: "...", trendUp: false }
  });
  
  const [chartData, setChartData] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('http://127.0.0.1:8000/api/dashboard/stats');
        const chartRes = await fetch('http://127.0.0.1:8000/api/dashboard/chart');
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (chartRes.ok) setChartData(await chartRes.json());
      } catch (e) {
        console.error("Dashboard API Error", e);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 2000); // Live updates
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pb-8">
      <Header pageTitle="Building Overview" onNavigate={onNavigate} />
      
      <div className="px-8 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatMetric 
          label="Building Health" 
          value={stats.health.value} 
          trend={stats.health.trend} 
          trendUp={stats.health.trendUp} 
          icon={Activity} 
          colorVar="var(--color-success)" 
        />
        <StatMetric 
          label="Energy Usage" 
          value={stats.energy.value} 
          trend={stats.energy.trend} 
          trendUp={stats.energy.trendUp} 
          icon={Zap} 
          colorVar="var(--color-warning)" 
        />
        <StatMetric 
          label="Active Occupants" 
          value={stats.occupants.value} 
          trend={stats.occupants.trend} 
          trendUp={stats.occupants.trendUp} 
          icon={Users} 
          colorVar="var(--color-primary)" 
        />
        <StatMetric 
          label="Active Alerts" 
          value={stats.alerts.value} 
          trend={stats.alerts.trend} 
          trendUp={stats.alerts.trendUp} 
          icon={AlertTriangle} 
          colorVar="var(--color-danger)" 
        />
      </div>

      <div className="px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard title="Real-time Consumption" className="lg:col-span-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="uv" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorUv)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="System Status">
          <div className="space-y-4">
            {['HVAC System', 'Lighting Control', 'Elevator Bank A', 'Fire Safety', 'Security Grid'].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--glass-border)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-[var(--color-warning)] shadow-[0_0_8px_var(--color-warning)]' : 'bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)]'}`}></div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded bg-[var(--glass-border)] ${i === 2 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                  {i === 2 ? 'Maintenance' : 'Optimal'}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
