import React from 'react';
import { Home, Activity, ShieldCheck, Zap, Settings, BarChart3, Info } from 'lucide-react';
import '../../styles/theme.css';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar = ({ activePage, onNavigate }: SidebarProps) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Overview' },
    { id: 'maintenance', icon: Activity, label: 'Predictive Maint.' },
    { id: 'energy', icon: Zap, label: 'Energy Monitor' },
    { id: 'access', icon: ShieldCheck, label: 'Access Control' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'about', icon: Info, label: 'About' },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-[rgba(255,255,255,0.05)] flex flex-col z-50 rounded-none bg-[var(--glass-bg)] backdrop-blur-xl transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] shadow-[0_0_15px_var(--color-primary)] flex items-center justify-center">
          <Activity size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-main)] tracking-wider transition-colors">AURORA</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-[var(--glass-border)] text-[var(--color-primary)] shadow-[0_0_10px_rgba(0,243,255,0.1)] border border-[rgba(0,243,255,0.2)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--glass-border)]'
              }`}
            >
              <Icon size={20} className={isActive ? 'drop-shadow-[0_0_5px_var(--color-primary)]' : ''} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass-border)] transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-main)] transition-colors">John Doe</p>
            <p className="text-xs text-[var(--text-muted)] transition-colors">Facility Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
