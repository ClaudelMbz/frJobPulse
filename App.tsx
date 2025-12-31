import React, { useState } from 'react';
import { AppView } from './types';
import { AnalysisView } from './components/AnalysisView';
import { SearchView } from './components/SearchView'; 
import { ProfileView } from './components/ProfileView';
import { ScraperView } from './components/ScraperView';
import { LayoutDashboard, Menu, User, Bot, FileText, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.STRATEGY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-500 font-bold text-xl mb-10">
            <Sparkles size={28} />
            <span>JobPulse FR</span>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => { setCurrentView(AppView.STRATEGY); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === AppView.STRATEGY 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <LayoutDashboard size={20} />
              Stratégie
            </button>
            <button 
              onClick={() => { setCurrentView(AppView.PROFILE); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === AppView.PROFILE 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <User size={20} />
              Mon Profil
            </button>
            <button 
              onClick={() => { setCurrentView(AppView.GENERATOR); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === AppView.GENERATOR 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <FileText size={20} />
              Générateur CV/Lettre
            </button>

            <div className="h-px bg-slate-800 my-4 mx-4"></div>

            <button 
              onClick={() => { setCurrentView(AppView.SCRAPER); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === AppView.SCRAPER
                  ? 'bg-pink-600/10 text-pink-400 border border-pink-600/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-pink-400'
              }`}
            >
              <Bot size={20} />
              Laboratoire Scraping
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800">
           <div className="text-xs text-slate-500 text-center italic">
             Mode : Générateur Direct Actif
           </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="lg:hidden p-4 flex justify-between items-center bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
           <span className="font-bold text-indigo-500">JobPulse FR</span>
           <button onClick={toggleSidebar} className="text-white">
             <Menu size={24} />
           </button>
        </div>

        <div className="h-full">
            {currentView === AppView.STRATEGY && (
              <AnalysisView onSelectMethod={(id) => {
                 setCurrentView(AppView.GENERATOR);
              }} />
            )}

            {currentView === AppView.PROFILE && (
              <ProfileView onNavigateToSearch={() => setCurrentView(AppView.GENERATOR)} />
            )}
            
            {currentView === AppView.GENERATOR && (
              <SearchView />
            )}

            {currentView === AppView.SCRAPER && (
              <ScraperView onNavigateToSearch={() => setCurrentView(AppView.GENERATOR)} />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;