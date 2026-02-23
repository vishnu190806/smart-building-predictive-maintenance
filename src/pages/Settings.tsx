import React from 'react';
import { Header } from '../components/layout/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { User, Bell, Shield, Database, Save } from 'lucide-react';

export const Settings = () => {
  const [formData, setFormData] = React.useState({
    fullName: 'John Doe',
    email: 'john.doe@aurora.com',
    phone: '+1 (555) 012-3456',
    notifications: {
      critical: true,
      daily: false,
      security: true
    }
  });
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  React.useEffect(() => {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    setStatus('saving');
    setTimeout(() => {
      localStorage.setItem('userSettings', JSON.stringify(formData));
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof typeof formData.notifications) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  return (
    <div className="pb-8">
      <Header pageTitle="System Settings" />
      
      <div className="px-8 mt-8 max-w-4xl mx-auto space-y-8">
        
        {/* Main Settings Form */}
        <GlassCard title="Profile Information">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {formData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-main)]">{formData.fullName}</h3>
              <p className="text-[var(--text-muted)]">Senior Facility Manager</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3 text-[var(--text-main)] focus:border-[var(--color-primary)] outline-none transition-all shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3 text-[var(--text-main)] focus:border-[var(--color-primary)] outline-none transition-all shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3 text-[var(--text-main)] focus:border-[var(--color-primary)] outline-none transition-all shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Role</label>
              <input type="text" defaultValue="Administrator" disabled className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3 text-[var(--text-muted)] cursor-not-allowed opacity-70" />
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Notification Preferences">
          <div className="space-y-4">
            {[
              { key: 'critical', label: 'Critical System Alerts', desc: 'Receive emails for critical hardware failures' },
              { key: 'daily', label: 'Daily Reports', desc: 'Detailed summary of daily energy consumption' },
              { key: 'security', label: 'Security Breaches', desc: 'Instant SMS alerts for unauthorized access' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg)]/80 transition-colors">
                <div>
                  <h4 className="text-[var(--text-main)] font-medium">{item.label}</h4>
                  <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.notifications[item.key as keyof typeof formData.notifications]} 
                    onChange={() => handleToggle(item.key as any)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-[var(--text-dim)]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={status === 'saving'}
            className={`flex items-center gap-2 px-6 py-3 rounded font-bold transition-all ${
              status === 'saved' 
                ? 'bg-[var(--color-success)] text-white' 
                : 'bg-[var(--color-primary)] text-black hover:opacity-90'
            }`}
          >
            {status === 'saving' ? (
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            ) : status === 'saved' ? (
              <Save size={18} />
            ) : (
              <Save size={18} />
            )}
            {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
