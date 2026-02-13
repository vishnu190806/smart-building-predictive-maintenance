import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { Activity, AlertTriangle, CheckCircle, RotateCw, Thermometer, Wrench, Cpu } from 'lucide-react';

export const PredictiveMaintenance = () => {
  const [formData, setFormData] = useState({
    rotational_speed: 1500,
    temperature: 300,
    torque: 40,
    tool_wear: 0
  });

  const [modelType, setModelType] = useState<'isolation_forest' | 'random_forest'>('isolation_forest');
  const [result, setResult] = useState<{ is_anomaly: number; anomaly_score: number; model?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "Rotational speed [rpm]": Number(formData.rotational_speed),
          "Process temperature [K]": Number(formData.temperature),
          "Torque [Nm]": Number(formData.torque),
          "Tool wear [min]": Number(formData.tool_wear),
          "model_type": modelType
        })
      });

      if (!response.ok) throw new Error('Prediction failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('System Offline or API Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-8">
      <Header pageTitle="Predictive Maintenance" />
      
      <div className="px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <GlassCard title="Sensor Diagnostics">
          <form onSubmit={handlePredict} className="space-y-6">
            
            {/* Model Selection */}
            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
              <label className="flex items-center gap-2 text-[var(--color-primary)] text-sm font-bold mb-3 uppercase tracking-wider">
                <Cpu size={16} /> AI Model Selection
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="model" 
                    checked={modelType === 'isolation_forest'} 
                    onChange={() => setModelType('isolation_forest')}
                    className="accent-[var(--color-primary)]"
                  />
                  <span className={`text-sm ${modelType === 'isolation_forest' ? 'text-white' : 'text-gray-400'}`}>
                    Anomaly Detection <span className="text-xs opacity-50">(Isolation Forest)</span>
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="model" 
                    checked={modelType === 'random_forest'} 
                    onChange={() => setModelType('random_forest')}
                    className="accent-[var(--color-primary)]"
                  />
                  <span className={`text-sm ${modelType === 'random_forest' ? 'text-white' : 'text-gray-400'}`}>
                    Failure Classification <span className="text-xs opacity-50">(Random Forest)</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <RotateCw size={16} /> Speed (RPM)
                </label>
                <input 
                  type="number" 
                  value={formData.rotational_speed}
                  onChange={(e) => setFormData({...formData, rotational_speed: Number(e.target.value)})}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-3 text-white focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Thermometer size={16} /> Temp (K)
                </label>
                <input 
                  type="number" 
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: Number(e.target.value)})}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-3 text-white focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Activity size={16} /> Torque (Nm)
                </label>
                <input 
                  type="number" 
                  value={formData.torque}
                  onChange={(e) => setFormData({...formData, torque: Number(e.target.value)})}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-3 text-white focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Wrench size={16} /> Wear (min)
                </label>
                <input 
                  type="number" 
                  value={formData.tool_wear}
                  onChange={(e) => setFormData({...formData, tool_wear: Number(e.target.value)})}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-3 text-white focus:border-[var(--color-primary)] outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Running Analysis...' : 'Run Diagnostics'}
            </button>
          </form>
        </GlassCard>

        {/* Results Panel */}
        <div className="space-y-6">
          <GlassCard title="Analysis Result">
            {result ? (
              <div className={`text-center p-8 rounded-xl border ${result.is_anomaly ? 'bg-[rgba(239,68,68,0.1)] border-[var(--color-danger)]' : 'bg-[rgba(16,185,129,0.1)] border-[var(--color-success)]'}`}>
                {result.is_anomaly ? (
                  <>
                    <AlertTriangle size={64} className="mx-auto text-[var(--color-danger)] mb-4" />
                    <h3 className="text-2xl font-bold text-[var(--color-danger)]">
                      {result.model === 'Random Forest' ? 'Machine Failure Predicted' : 'Anomaly Detected'}
                    </h3>
                    <p className="text-gray-300 mt-2">
                      {result.model === 'Random Forest' 
                        ? 'The model predicts a high probability of equipment failure.' 
                        : 'Equipment is behaving abnormally compared to historical data.'}
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle size={64} className="mx-auto text-[var(--color-success)] mb-4" />
                    <h3 className="text-2xl font-bold text-[var(--color-success)]">System Optimal</h3>
                    <p className="text-gray-300 mt-2">No issues detected. Equipment operating within normal parameters.</p>
                  </>
                )}
                <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.1)] grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 block">Model Used</span>
                    <span className="font-mono text-white text-sm">{result.model || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">
                      {result.model === 'Random Forest' ? 'Failure Probability' : 'Anomaly Score'}
                    </span>
                    <span className="font-mono text-white text-xl">{result.anomaly_score.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 min-h-[300px]">
                <Activity size={48} className="mb-4 opacity-20" />
                <p>Select a model and enter readings.</p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 rounded bg-[rgba(239,68,68,0.2)] text-[var(--color-danger)] text-center text-sm">
                {error}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
