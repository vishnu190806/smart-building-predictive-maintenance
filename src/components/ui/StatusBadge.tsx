import React from 'react';

type StatusType = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
}

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const getColorVar = (s: StatusType) => {
    switch (s) {
      case 'success': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      case 'danger': return 'var(--color-danger)';
      case 'primary': return 'var(--color-primary)';
      case 'neutral': default: return 'var(--text-muted)';
    }
  };

  const color = getColorVar(status);

  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{ 
        borderColor: color, 
        color: color,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></span>
      {label}
    </span>
  );
};
