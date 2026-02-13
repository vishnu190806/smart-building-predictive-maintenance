import React from 'react';
import { GlassCard } from './GlassCard';
import { LucideIcon } from 'lucide-react';

interface StatMetricProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  colorVar?: string;
}

export const StatMetric = ({ label, value, trend, trendUp, icon: Icon, colorVar = 'var(--color-primary)' }: StatMetricProps) => {
  return (
    <GlassCard className="relative overflow-hidden group hover:border-[rgba(255,255,255,0.15)] transition-all">
      <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
        <Icon size={120} color={colorVar} />
      </div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[var(--text-muted)] text-sm font-medium uppercase tracking-wider transition-colors">{label}</p>
          <h3 className="text-3xl font-bold text-[var(--text-main)] mt-1 shadow-glow transition-colors">{value}</h3>
          
          {trend && (
            <div className={`flex items-center mt-3 text-xs font-medium ${trendUp ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
              <span className="mr-1">{trendUp ? '↑' : '↓'}</span>
              {trend} vs last week
            </div>
          )}
        </div>
        
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)]"
          style={{ backgroundColor: `color-mix(in srgb, ${colorVar} 15%, transparent)`, border: `1px solid ${colorVar}` }}
        >
          <Icon size={20} color={colorVar} />
        </div>
      </div>
      
      {/* Progress Bar visual for decoration */}
      <div className="w-full h-1 bg-[rgba(255,255,255,0.05)] mt-4 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full" 
          style={{ width: '70%', backgroundColor: colorVar, boxShadow: `0 0 10px ${colorVar}` }}
        ></div>
      </div>
    </GlassCard>
  );
};
