import React from 'react';
import { Header } from '../components/layout/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { User, Bell, Shield, Database, Save } from 'lucide-react';

export const Settings = () => {
  return (
    <div className="pb-8">
      <Header pageTitle="System Settings" />
      
      <div className="px-8 mt-8 max-w-4xl mx-auto space-y-8">
        
        {/* Main Settings Form */}
        <GlassCard title="Profile Information">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              JD
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">John Doe</h3>
              <p className="text-gray-400">Senior Facility Manager</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-3 text-white focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email Address</label>
              <input type="email" defaultValue="john.doe@aurora.com" className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-3 text-white focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
              <input type="tel" defaultValue="+1 (555) 012-3456" className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-3 text-white focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Role</label>
              <input type="text" defaultValue="Administrator" disabled className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded p-3 text-gray-500 cursor-not-allowed" />
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Notification Preferences">
          <div className="space-y-4">
            {[
              { label: 'Critical System Alerts', desc: 'Receive emails for critical hardware failures', checked: true },
              { label: 'Daily Reports', desc: 'Detailed summary of daily energy consumption', checked: false },
              { label: 'Security Breaches', desc: 'Instant SMS alerts for unauthorized access', checked: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded bg-[rgba(255,255,255,0.02)]">
                <div>
                  <h4 className="text-white font-medium">{item.label}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 rounded bg-[var(--color-primary)] text-black font-bold hover:opacity-90 transition-opacity">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
