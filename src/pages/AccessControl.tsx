import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Shield, Lock, UserCheck, AlertOctagon, RefreshCw } from 'lucide-react';

interface AccessLog {
  Log_ID: number;
  User_Name: string;
  Role: string;
  Door_Location: string;
  Access_Time: string;
  Access_Status: string;
  Door_Zone: string;
}

interface AccessStats {
  total_entries: number;
  security_alerts: number;
  active_doors: number;
}

export const AccessControl = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<AccessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Allow for local dev URL
      const API_BASE = 'http://127.0.0.1:8000';
      
      const [logsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/access/logs`),
        fetch(`${API_BASE}/api/access/stats`)
      ]);

      if (!logsRes.ok || !statsRes.ok) throw new Error('Failed to fetch data');

      const logsData = await logsRes.json();
      const statsData = await statsRes.json();

      setLogs(logsData);
      setStats(statsData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend. Is uvicorn running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pb-8">
      <Header pageTitle="Access Control: The Digital Doorman" />
      
      {error && (
        <div className="px-8 mt-4">
          <div className="p-4 rounded-lg bg-[rgba(255,46,92,0.1)] border border-[var(--color-danger)] text-white flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchData} className="text-sm underline">Retry</button>
          </div>
        </div>
      )}

      <div className="px-8 mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs uppercase">Total Entries</p>
            <h3 className="text-2xl font-bold mt-1 text-white">
              {stats ? stats.total_entries : '-'}
            </h3>
          </div>
          <UserCheck className="text-[var(--color-primary)]" size={32} />
        </GlassCard>
        
        <GlassCard className={`flex items-center justify-between ${stats?.security_alerts ? 'border-[var(--color-danger)] shadow-[0_0_20px_rgba(255,46,92,0.1)]' : ''}`}>
          <div>
            <p className="text-[var(--color-danger)] text-xs uppercase font-bold">Security Alerts</p>
            <h3 className="text-2xl font-bold mt-1 text-[var(--color-danger)]">
              {stats ? stats.security_alerts : '-'}
            </h3>
          </div>
          <AlertOctagon className="text-[var(--color-danger)]" size={32} />
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs uppercase">Active Doors</p>
            <h3 className="text-2xl font-bold mt-1 text-white">
              {stats ? stats.active_doors : '-'}
            </h3>
          </div>
          <Lock className="text-[var(--color-success)]" size={32} />
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs uppercase">System Status</p>
            <h3 className="text-2xl font-bold mt-1 text-white">
              {loading ? 'Syncing...' : 'Online'}
            </h3>
          </div>
          <RefreshCw className={`text-[var(--color-secondary)] ${loading ? 'animate-spin' : ''}`} size={32} />
        </GlassCard>
      </div>

      <div className="px-8 mt-6">
        <GlassCard title="Live Access Feed">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.05)] text-gray-400 text-sm">
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Zone</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.Log_ID} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <td className="p-3 font-medium text-white">{log.User_Name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-[rgba(255,255,255,0.05)] text-gray-300">{log.Role}</span>
                    </td>
                    <td className="p-3 text-gray-400">{log.Door_Location}</td>
                    <td className="p-3 text-gray-500 text-xs uppercase">{log.Door_Zone}</td>
                    <td className="p-3 font-mono text-xs text-gray-500">{log.Access_Time}</td>
                    <td className="p-3">
                      <StatusBadge 
                        status={log.Access_Status === 'Granted' ? 'success' : 'danger'} 
                        label={log.Access_Status} 
                      />
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-gray-500">No logs found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
