import React, { ReactNode } from 'react';
import '../../styles/theme.css';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  headerAction?: ReactNode;
}

export const GlassCard = ({ children, className = '', title, headerAction }: GlassCardProps) => {
  return (
    <div className={`glass-panel p-6 ${className}`} style={{ color: 'var(--text-main)' }}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gradient">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
