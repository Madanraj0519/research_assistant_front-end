// import { useState, useEffect } from 'react';
import { Card, Button } from '../components/UI';
import { Moon, Sun, LogOut, Shield, Database, ExternalLink } from 'lucide-react';
import { useTheme } from '../App';
// import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { getInitials } from "../utils/getInitial";
 
const Settings = () => {
  const { isDark, toggleTheme, appMode } = useTheme();
  // const navigate = useNavigate();

  const { logout, user } = useAuth();

  console.log("Current user in Settings:", user);

  const openOptionsPage = () => {
    // @ts-ignore
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      // @ts-ignore
      chrome.runtime.openOptionsPage();
    } else {
      window.open('#/home?view=options', '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
        {appMode === 'popup' && (
          <Button variant="secondary" onClick={openOptionsPage} className="text-xs px-2 py-1 h-8">
            <ExternalLink className="w-3 h-3" />
            Full Dashboard
          </Button>
        )}
      </header>

      {/* Profile Section */}
      <Card className="flex justify-start items-start gap-4 p-5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {user ? getInitials(user.username || "") : "G"}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{ user ? user.username : "Guest"}</h3>
          <p className="text-sm text-gray-500 truncate mt-2">{ user ? user.email : "Not logged in"}</p>
          <p className="text-sm text-gray-500 truncate mt-2">{ user ? user.role.roleName : "Guest"}</p>
        </div>
        <Button variant="ghost" className="shrink-0">Edit</Button>
      </Card>

      <div className="space-y-4">

        {/* App Preferences */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Preferences</h3>
          <Card className="divide-y divide-gray-100 dark:divide-gray-700 p-0 overflow-hidden">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={toggleTheme}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-orange-100 text-orange-600'}`}>
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Appearance</p>
                  <p className="text-xs text-gray-500">Toggle light/dark mode</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-primary-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isDark ? 'left-[22px]' : 'left-0.5'}`} />
              </div>
            </div>
          </Card>
        </section>

        {/* Data & Account */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Data & Account</h3>
          <Card className="divide-y divide-gray-100 dark:divide-gray-700 p-0 overflow-hidden">
            <div className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer text-gray-700 dark:text-gray-200">
              <Database className="w-5 h-5 text-gray-400" />
              <span>Clear Cache</span>
            </div>
            <div className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer text-gray-700 dark:text-gray-200">
               <Shield className="w-5 h-5 text-gray-400" />
               <span>Privacy Policy</span>
            </div>
             <div onClick={logout} className="p-4 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer text-red-600">
               <LogOut className="w-5 h-5" />
               <span>Log Out</span>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Settings;
