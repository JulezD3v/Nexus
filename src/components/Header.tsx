import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, PieChart, Info, Server, RefreshCw, Menu, X, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentView: 'terminal' | 'dashboard';
  setCurrentView: (view: 'terminal' | 'dashboard') => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setAboutOpen: (open: boolean) => void;
  gatewayInfo: { configured: boolean; online?: boolean; mode: string } | null;
  isResetting: boolean;
  handleResetDatabase: () => void;
  fetchStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  mobileMenuOpen,
  setMobileMenuOpen,
  setAboutOpen,
  gatewayInfo,
  isResetting,
  handleResetDatabase,
  fetchStats,
}) => {
  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          
          {/* Left Brand Area */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#49B847] flex items-center justify-center text-white font-extrabold text-xl shadow-md border-2 border-white select-none">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg tracking-tight text-slate-900">Safaricom</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  NEXUS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Overscratched Card Recovery</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrentView('terminal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                currentView === 'terminal'
                  ? 'bg-[#49B847]/10 text-[#49B847] border border-[#49B847]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              id="tab-terminal"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Validation Terminal</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('dashboard');
                fetchStats();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                currentView === 'dashboard'
                  ? 'bg-[#49B847]/10 text-[#49B847] border border-[#49B847]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              id="tab-dashboard"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Platform Dashboard</span>
            </button>
            <button
              onClick={() => setAboutOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition duration-150"
              id="btn-about-trigger"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>

            {/* Gateway Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                gatewayInfo?.configured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title={gatewayInfo?.configured ? `FastAPI Gateway Proxy: ${gatewayInfo.mode}` : 'Built-in Express Engine'}
            >
              <Server className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">
                {gatewayInfo?.configured ? 'FastAPI Gateway Proxy' : 'Local Nexus Engine'}
              </span>
              <span className={`w-2 h-2 rounded-full ${gatewayInfo?.configured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {/* Reset Sandbox */}
            <button
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition duration-150 border border-slate-200 disabled:opacity-50"
              title="Reset Simulated Telecom Database"
              id="btn-reset-db"
            >
              <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset</span>
            </button>
          </nav>

          {/* Mobile Hamburger menu at the far right top corner */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
              title="Reset Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200"
              aria-label="Toggle Menu"
              id="btn-hamburger"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-md z-30"
          >
            <div className="px-4 py-4 space-y-2.5">
              <button
                onClick={() => {
                  setCurrentView('terminal');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition ${
                  currentView === 'terminal'
                    ? 'bg-[#49B847]/10 text-[#49B847]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Validation Terminal</span>
              </button>
              
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  fetchStats();
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition ${
                  currentView === 'dashboard'
                    ? 'bg-[#49B847]/10 text-[#49B847]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Platform Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setAboutOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 text-left transition"
              >
                <Info className="w-4 h-4" />
                <span>About Nexus Solution</span>
              </button>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#49B847]" />
                  <span className="font-bold text-slate-900">Nexus Core Engine Active</span>
                </div>
                <p className="text-slate-600 leading-normal">
                  This Safaricom internal hackathon solution uses dynamic partial sequence validation to match scratch card artifacts without compromising security bounds.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
