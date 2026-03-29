import React, { useState, useEffect } from 'react';
import { Page } from './types';
import Cover from './pages/Cover';
import Home from './pages/Home';
import Archive from './pages/Archive';
import Stills from './pages/Stills';
import Stack from './pages/Stack';
import Info from './pages/Info';
import DynamicStory from './pages/DynamicStory';
import GravityBackground from './components/GravityBackground';
import { ThemeProvider } from './components/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('cover');

  useEffect(() => {
    const p = window.location.pathname;
    const h = window.location.hash;
    if (h === '#admin' || p.includes('/admin') || p.includes('/auth')) {
      setCurrentPage('admin');
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'cover': return <Cover onOpen={() => setCurrentPage('home')} />;
      case 'home': return <Home onNavigate={setCurrentPage} />;
      case 'index': return <Archive onNavigate={setCurrentPage} />;
      case 'stills': return <Stills onNavigate={setCurrentPage} />;
      case 'stack': return <Stack onNavigate={setCurrentPage} />;
      case 'info': return <Info onNavigate={setCurrentPage} />;
      case 'admin': return <AdminLogin onNavigate={setCurrentPage} />;
      case 'admin-dashboard': return <AdminDashboard onNavigate={setCurrentPage} />;
      default:
        if (currentPage.startsWith('story-')) {
          const slug = currentPage.replace('story-', '');
          return <DynamicStory slug={slug} onNavigate={setCurrentPage} />;
        }
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-limestone text-charcoal font-display relative overflow-hidden transition-colors duration-500 dark:bg-[#1a1918] dark:text-limestone">
        <GravityBackground />
        <ThemeToggle />
        <div className="relative z-10">
          {renderPage()}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
