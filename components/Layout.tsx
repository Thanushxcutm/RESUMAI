
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
  onNavigateLogin?: () => void;
  onNavigateSignup?: () => void;
  onLogout?: () => void;
  score?: number;
  user?: User | null;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onNavigateHome, 
  onNavigateLogin, 
  onNavigateSignup, 
  onLogout,
  score, 
  user 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button 
              onClick={onNavigateHome}
              className="flex items-center space-x-2 group"
            >
              <div className="flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-105 transition-transform">
                  <rect width="40" height="40" rx="10" fill="url(#gradient-resumai)" />
                  <path d="M12 14C12 12.8954 12.8954 12 14 12H22.5858C23.1162 12 23.6249 12.2107 24 12.5858L27.4142 16C27.7893 16.3751 28 16.8838 28 17.4142V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14Z" fill="white" />
                  <path d="M16 18H24M16 22H24M16 26H20" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                  <path d="M22 28L25 24L28 26L31 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="gradient-resumai" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4F46E5" />
                      <stop offset="1" stopColor="#9333EA" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </button>
          </div>

          <div className="flex items-center space-x-6">
            {score !== undefined && (
              <div className="hidden lg:flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <div className="flex flex-col mr-3">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                  <span className="text-sm font-black text-slate-800 leading-none">{score}%</span>
                </div>
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full gradient-bg transition-all duration-1000" style={{ width: `${score}%` }}></div>
                </div>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-200 flex items-center justify-center hover:shadow-lg transition-all text-white font-bold text-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </button>
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                    <div className="px-4 py-4 border-b border-slate-100 mb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Your Account</p>
                      <p className="text-sm font-bold text-slate-900">{user.name || 'User'}</p>
                      <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                    </div>
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={onNavigateLogin}
                  className="text-slate-600 font-bold hover:text-slate-900 transition-colors text-sm px-4 py-2"
                >
                  Sign In
                </button>
                <button 
                  onClick={onNavigateSignup}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md active:scale-95"
                >
                  Join ResumAI
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 px-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center opacity-70">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ResumAI - Professional Resume Analysis</p>
          </div>
          <div className="flex space-x-8 mt-4 md:mt-0 items-center">
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
