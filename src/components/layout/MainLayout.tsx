import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const MainLayout = ({ children, activePage, onNavigate }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-[var(--bg-deep)] text-white font-sans selection:bg-[var(--color-primary)] selection:text-black">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="flex-1 ml-64 relative z-0">
        {children}
      </main>
    </div>
  );
};
