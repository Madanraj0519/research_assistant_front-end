import React, { useState, useEffect } from 'react';
import {NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Clock, Settings as SettingsIcon, Menu, X, ExternalLink, Maximize2 } from 'lucide-react';

// Navigation Components
const NavItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => `
      flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 flex-1 min-w-0
      ${isActive 
        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
    `}
  >
    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    <span className="text-xs truncate w-full text-center">{label}</span>
  </NavLink>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isAuthPage = location.pathname === '/';

  // Track window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Auth Redirect Check
  useEffect(() => {
    const isAuth = localStorage.getItem('ra_auth');
    if (isAuth && isAuthPage) {
      navigate('/home', { replace: true });
    } else if (!isAuth && !isAuthPage) {
      navigate('/');
    }
  }, [location.pathname, isAuthPage, navigate]);

  const isMobile = windowWidth < 640; // Tailwind's sm breakpoint

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-lg dark:text-white truncate block">Research AI</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 block sm:hidden">
                {windowWidth}px
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Open in Full Window Button - Show on mobile only */}
            {isMobile && (
              <button
                onClick={() => {
                  if (typeof chrome !== 'undefined' && chrome.tabs) {
                    chrome.tabs.create({
                      url: chrome.runtime.getURL('index.html?view=options')
                    });
                  }
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                title="Open in full window"
              >
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            
            {/* Open in New Tab Button - Show on desktop */}
            {!isMobile && (
              <button
                onClick={() => {
                  if (typeof chrome !== 'undefined' && chrome.tabs) {
                    chrome.tabs.create({
                      url: chrome.runtime.getURL('index.html?view=options')
                    });
                  }
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            
            {/* Hamburger Menu - Show on mobile only */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable area */}
      <main className="flex-1 overflow-y-auto">
        <div className={`p-4 ${isMobile ? 'pb-20' : 'pb-4'}`}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Show on mobile only */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-40 flex justify-around items-center px-2">
          <NavItem to="/home" icon={Home} label="Home" />
          <NavItem to="/notes" icon={FileText} label="Notes" />
          <NavItem to="/history" icon={Clock} label="History" />
          <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
        </nav>
      )}

      {/* Desktop Navigation - Show on desktop */}
      {!isMobile && (
        <nav className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex justify-around items-center px-2 py-3">
            <NavItem to="/home" icon={Home} label="Home" />
            <NavItem to="/notes" icon={FileText} label="Notes" />
            <NavItem to="/history" icon={Clock} label="History" />
            <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
          </div>
        </nav>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Menu Panel */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800
        transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-lg font-bold dark:text-white mb-6">Navigation</h2>
            <nav className="flex flex-col gap-2">
              <NavItem 
                to="/home" 
                icon={Home} 
                label="Home" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <NavItem 
                to="/notes" 
                icon={FileText} 
                label="Notes" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <NavItem 
                to="/history" 
                icon={Clock} 
                label="History" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <NavItem 
                to="/settings" 
                icon={SettingsIcon} 
                label="Settings" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </nav>
          </div>
          
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-medium dark:text-gray-300 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/notes/new');
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                New Note
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                Search Notes
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;

