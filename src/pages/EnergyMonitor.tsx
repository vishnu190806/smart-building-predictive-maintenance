import React from 'react';
import { Header } from '../components/layout/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Zap, Clock, Users } from 'lucide-react';

export const EnergyMonitor = () => {
  const [energyData, setEnergyData] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/energy/chart');
        if (res.ok) setEnergyData(await res.json());
      } catch (e) {
        console.error("Energy API Error", e);
      }
    };
    fetchData();
  }, []);

  const peakData = [
    { name: 'HVAC', value: 450 },
    { name: 'Lighting', value: 210 },
    { name: 'Server Room', value: 380 },
    { name: 'Elevators', value: 120 },
  ];
  return (
    <div className="pb-8">
      <Header pageTitle="Energy Monitor" />

      {/* KPI Cards */}
      <div className="px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[rgba(255,255,0,0.1)] text-yellow-400">
                    <Zap size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-400">Current Load</p>
                    <h3 className="text-2xl font-bold text-white">452 kWh</h3>
                </div>
            </div>
        </GlassCard>
        <GlassCard>
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[rgba(0,255,0,0.1)] text-green-400">
                    <Clock size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-400">Peak Hours</p>
                    <h3 className="text-2xl font-bold text-white">09:00 - 18:00</h3>
                </div>
            </div>
        </GlassCard>
        <GlassCard>
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[rgba(0,200,255,0.1)] text-cyan-400">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-400">Occupancy Impact</p>
                    <h3 className="text-2xl font-bold text-white">High Correlation</h3>
                </div>
            </div>
        </GlassCard>
      </div>

      <div className="px-8 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Load Profile Chart */}
        <GlassCard title="Daily Load Profile (Session 2 Findings)">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facd05" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#facd05" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f15', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="load" stroke="#facd05" fillOpacity={1} fill="url(#colorLoad)" name="Energy (kWh)" />
                <Area type="monotone" dataKey="occupancy" stroke="#00f3ff" fillOpacity={0} name="Occupancy" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Breakdown Chart */}
        <GlassCard title="Consumption by System">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="name" type="category" stroke="#fff" width={100} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#0f0f15', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#8884d8">
                    {
                        peakData.map((entry, index) => (
                            <cell key={`cell-${index}`} fill={['#facd05', '#00f3ff', '#ff0055', '#bb00ff'][index % 4]} />
                        ))
                    }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
