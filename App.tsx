import { useState, useEffect, useContext, createContext } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeContextType, AppMode } from './types';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/AuthPage';
import HomePage from './pages/Home';
import NotesPage from './pages/Notes';
import NoteEditorPage from './pages/NoteEditor';
import HistoryPage from './pages/History';
import SettingsPage from './pages/Settings';

// Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};





const App = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ra_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Detect view mode from URL or context
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    
    if (view === 'sidepanel') return 'sidepanel';
    if (view === 'options') return 'options';
    if (view === 'popup') return 'popup';
    
    // Detect based on URL and window size
    if (window.location.pathname.includes('index.html')) {
      return window.innerWidth <= 768 ? 'sidepanel' : 'options';
    }
    return 'sidepanel';
  });

  // Apply theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ra_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ra_theme', 'light');
    }
  }, [isDark]);

  // Set body data attribute for CSS
  useEffect(() => {
    document.body.setAttribute('data-view', appMode);
    
    // Add responsive classes to body for CSS targeting
    const width = window.innerWidth;
    document.body.classList.remove('panel-xs', 'panel-sm', 'panel-md', 'panel-lg');
    
    if (width < 400) document.body.classList.add('panel-xs');
    else if (width < 640) document.body.classList.add('panel-sm');
    else if (width < 768) document.body.classList.add('panel-md');
    else document.body.classList.add('panel-lg');
  }, [appMode]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, appMode, setAppMode }}>
      {/* <StoreProvider> */}
        <div className={`
          w-full min-h-screen
          bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 
          font-sans selection:bg-primary-100 dark:selection:bg-primary-900 
          overflow-hidden
        `}>
          <HashRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/notes/:id" element={<NoteEditorPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </HashRouter>
        </div>
      {/* </StoreProvider> */}
    </ThemeContext.Provider>
  );
};

export default App;