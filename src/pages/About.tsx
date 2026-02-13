import React from 'react';
import { Header } from '../components/layout/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { Users, Award, Shield } from 'lucide-react';

interface AboutProps {
  onNavigate?: (page: string) => void;
}

export const About = ({ onNavigate }: AboutProps) => {
  const teamMembers = [
    { id: '24EG107A01', name: 'B Alekhya' },
    { id: '24EG107A02', name: 'B Vishnu Vardhan' },
    { id: '24EG107A03', name: 'B Avinash' },
    { id: '24EG107A04', name: 'B Akshith' },
  ];

  return (
    <div className="pb-8">
      <Header pageTitle="About Us" onNavigate={onNavigate} />

      <div className="px-8 mt-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Team Header */}
          <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4 ring-1 ring-[var(--color-primary)]/30">
              <Users size={32} />
            </div>
            <h1 className="text-4xl font-bold text-[var(--text-main)] tracking-tight">TEAM-A02</h1>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Smart Building Predictive Maintenance Project
            </p>
          </div>

          {/* Team Members Card */}
          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-[var(--color-secondary)]/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
                <Shield size={20} className="text-[var(--color-secondary)]" />
                Team Members
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member, index) => (
                  <div 
                    key={member.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                        {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[var(--text-main)] font-semibold group-hover:text-[var(--color-primary)] transition-colors">{member.name}</p>
                      <p className="text-xs text-[var(--text-muted)] font-mono opacity-80">{member.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Project Details Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
             <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <p className="text-[var(--color-primary)] font-bold text-lg">2026</p>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Project Year</p>
             </div>
             <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <p className="text-[var(--color-success)] font-bold text-lg">Active</p>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Status</p>
             </div>
             <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <p className="text-[var(--color-warning)] font-bold text-lg">v1.0.4</p>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Version</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
