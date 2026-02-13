import React from 'react';
import { Header } from '../components/layout/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { FileText, Download, Filter, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

export const Reports = () => {
  const [reports, setReports] = React.useState<any[]>([]);
  const [generating, setGenerating] = React.useState(false);

  const fetchReports = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/reports');
      if (res.ok) setReports(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/reports/generate', { method: 'POST' });
      if (res.ok) {
        const newReport = await res.json();
        setReports(prev => [newReport, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pb-8">
      <Header pageTitle="System Reports" />
      
      <div className="px-8 mt-8">
        <GlassCard title="Generated Reports">
          <div className="flex justify-end mb-6">
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-black font-bold hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
            >
              {generating ? <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"/> : <BarChart3 size={16} />} 
              {generating ? 'Generating...' : 'Generate New Report'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.05)] text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4">Report Name</th>
                  <th className="p-4">Date Generated</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 divide-y divide-[rgba(255,255,255,0.05)]">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-[rgba(255,255,255,0.05)] text-[var(--color-primary)]">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{report.name}</p>
                          <p className="text-xs text-gray-500">{report.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{report.date}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] font-mono">
                        {report.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {report.status === 'Ready' ? (
                          <CheckCircle size={14} className="text-[var(--color-success)]" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border-2 border-[var(--color-warning)] border-t-transparent animate-spin" />
                        )}
                        <span className={report.status === 'Ready' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}>
                          {report.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 rounded hover:bg-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white transition-colors">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <GlassCard title="System Alerts Summary">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded bg-[rgba(239,68,68,0.1)] border border-[var(--color-danger)]">
                <AlertTriangle className="text-[var(--color-danger)]" size={24} />
                <div>
                  <h4 className="text-[var(--color-danger)] font-bold">Critical Error Detected</h4>
                  <p className="text-sm text-gray-300">HVAC Unit 3 compressor failure predicted.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded bg-[rgba(255,189,46,0.1)] border border-[var(--color-warning)]">
                <AlertTriangle className="text-[var(--color-warning)]" size={24} />
                <div>
                  <h4 className="text-[var(--color-warning)] font-bold">Maintenance Overdue</h4>
                  <p className="text-sm text-gray-300">Elevator Bank B inspection required.</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Storage Usage">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Log Database</span>
                  <span className="text-white">45 GB / 100 GB</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                  <div className="h-full bg-[var(--color-primary)] w-[45%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Video Archives</span>
                  <span className="text-white">880 GB / 2 TB</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                  <div className="h-full bg-[var(--color-secondary)] w-[44%]" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
