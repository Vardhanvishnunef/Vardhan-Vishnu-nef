
import React from 'react';
import { Page } from '../types';

interface NavigationProps {
  active: Page;
  onNavigate: (page: Page) => void;
}

const Navigation: React.FC<NavigationProps> = ({ active, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'index', icon: 'folder_open', label: 'Index' },
    { id: 'stills', icon: 'photo_library', label: 'Stills' },
    { id: 'stack', icon: 'layers', label: 'Stack' },
    { id: 'info', icon: 'person', label: 'Info' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-paper/95 backdrop-blur-md border-t border-border-paper/40 px-4 pb-8 pt-4 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto flex justify-between items-center gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Page)}
            className={`flex flex-col items-center gap-1.5 flex-1 transition-all duration-300 ${active === item.id ? 'text-primary' : 'text-muted hover:text-charcoal'
              }`}
          >
            <span className={`material-symbols-outlined text-[24px] md:text-[28px] ${active === item.id ? 'font-variation-settings-"FILL" 1' : ''}`}>
              {item.icon}
            </span>
            <span className={`text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.15em] ${active === item.id ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
            {active === item.id && (
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
