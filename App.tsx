import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ResumeForm from './components/ResumeForm';
import ResultsDashboard from './components/ResultsDashboard';
import Dashboard from './components/Dashboard';
import { analyzeResume } from './services/geminiService';
import { storageService, HistoryItem } from './services/storageService';
import { AppState, ResumeAnalysis, User } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.HOME);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const activeUser = storageService.getActiveUser();
    if (activeUser) {
      setUser(activeUser);
      setHistory(storageService.getUserHistory(activeUser.id));
    }
  }, []);

  const handleGoHome = () => {
    setAnalysis(null);
    setAuthError('');
    setState(AppState.HOME);
  };

  const handleStartAnalysis = () => {
    if (!user) {
      setState(AppState.AUTH_LOGIN);
    } else {
      setState(AppState.INPUT);
    }
  };

  const handleAuth = async (isSignup: boolean) => {
    setAuthError('');
    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }
    
    setIsAuthLoading(true);
    try {
      let loggedUser;
      if (isSignup) {
        loggedUser = await storageService.register(email, password);
      } else {
        loggedUser = await storageService.login(email, password);
      }
      setUser(loggedUser);
      setEmail('');
      setPassword('');
      setState(AppState.INPUT);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
    setHistory([]);
    handleGoHome();
  };

  const handleDeleteAnalysis = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('resumai_history', JSON.stringify(newHistory));
  };

  const handleViewAnalysis = (analysis: ResumeAnalysis) => {
    setAnalysis(analysis);
    setState(AppState.RESULTS);
  };

  const handleSubmitResume = async (text: string) => {
    if (!user) {
      setState(AppState.AUTH_LOGIN);
      return;
    }
    setIsLoading(true);
    try {
      const result = await analyzeResume(text);
      setAnalysis(result);
      await storageService.saveAnalysis(user.id, text, result);
      setState(AppState.RESULTS);
    } catch (error) {
      console.error('Analyze resume error:', error);
      const msg = (error as any)?.message || String(error);

      const looksLikeTimeout = /timeout|engine timeout|timed out/i.test(msg);
      const noApiKey = !import.meta.env.VITE_GEMINI_API_KEY;

      if (looksLikeTimeout || noApiKey) {
        const mock: ResumeAnalysis = {
          advisorNote: 'Local dev analysis (mock). The real AI engine was unreachable or timed out.',
          summary: 'This is a mocked summary for local development.',
          skills: ['communication', 'problem-solving'],
          missingSkills: ['domain-specific skill'],
          job_matches: [{ role: 'Developer', fit_score: 50, reason: 'Transferable skills' }],
          improvements: [{ issue: 'Add metrics', suggestion: 'Quantify achievements', example_fix: 'Increased revenue by 12%' }],
          score: 50,
          atsScore: 55,
          improvedBulletPoints: [{ original: 'Old bullet', improved: 'Accomplished X as measured by Y by doing Z' }],
          atsAnalysis: {
            formattingStatus: 'Warning',
            formattingFeedback: 'Some sections missing for ATS parsing.',
            keywordDensityScore: 40,
            standardSectionsFound: ['experience', 'education'],
            missingStandardSections: ['certifications']
          }
        };

        setAnalysis(mock);
        try {
          await storageService.saveAnalysis(user.id, text, mock);
        } catch (e) {
          console.warn('Failed to persist mocked analysis locally:', e);
        }
        setState(AppState.RESULTS);
      } else {
        alert(`Analysis Failed: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthForm = (isSignup: boolean) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button 
          onClick={handleGoHome}
          className="mb-8 flex items-center text-slate-300 hover:text-white transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Home
        </button>
        
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-rocket text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isSignup ? 'Join ResumAI' : 'Sign In'}
            </h2>
            <p className="text-slate-300 text-sm">
              {isSignup ? 'Create your account to get started' : 'Welcome back to ResumAI'}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAuth(isSignup); }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white/15 transition-all"
              />
            </div>

            {authError && (
              <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i> {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg mt-6 flex items-center justify-center"
            >
              {isAuthLoading ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-2"></i> Processing...
                </>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-300 text-sm">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setState(AppState.AUTH_LOGIN)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setState(AppState.AUTH_SIGNUP)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Join ResumAI
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-16">
      <div className="max-w-5xl w-full text-center">
        <div className="mb-12">
          <div className="inline-block bg-gradient-to-br from-indigo-600 to-purple-600 p-1 rounded-2xl shadow-lg">
            <div className="bg-white rounded-xl px-6 py-3">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                <rect width="40" height="40" rx="10" fill="url(#gradient-icon)" />
                <path d="M12 14C12 12.8954 12.8954 12 14 12H22.5858C23.1162 12 23.6249 12.2107 24 12.5858L27.4142 16C27.7893 16.3751 28 16.8838 28 17.4142V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14Z" fill="white" />
                <path d="M16 18H24M16 22H24M16 26H20" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient-icon" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <p className="text-indigo-600 font-bold text-lg uppercase tracking-[0.3em]">AI-Powered Resume Analysis</p>
          
          <h1 className="text-7xl md:text-8xl font-black leading-[1.1]">
            <span className="block text-slate-900 mb-4">Don't get filtered</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Get hired</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium mt-8">
            Optimize your resume for ATS systems, improve your impact score, and land more interviews with AI-powered insights.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <button
            onClick={handleStartAnalysis}
            className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg px-10 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl active:scale-95"
          >
            <i className="fas fa-rocket mr-3"></i>
            {user ? 'Analyze Resume' : 'Get Started Free'}
            <i className="fas fa-arrow-right ml-3"></i>
          </button>

          {user && (
            <button
              onClick={() => setState(AppState.DASHBOARD)}
              className="inline-flex items-center bg-white border-2 border-slate-200 text-slate-900 font-bold text-lg px-10 py-4 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <i className="fas fa-chart-line mr-3"></i>
              View Dashboard
            </button>
          )}
        </div>

        {user && (
          <p className="mt-8 text-slate-600 text-lg">
            Welcome back, <span className="font-bold text-slate-900">{user.name || user.email}</span> 👋
          </p>
        )}

        {/* Trust indicators */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-6">Trusted by Job Seekers</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <span className="flex items-center space-x-2 text-slate-600 font-bold">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>ATS Optimized</span>
            </span>
            <span className="flex items-center space-x-2 text-slate-600 font-bold">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>AI Powered</span>
            </span>
            <span className="flex items-center space-x-2 text-slate-600 font-bold">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>Instant Results</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  switch (state) {
    case AppState.HOME:
      return (
        <Layout
          onNavigateHome={handleGoHome}
          onNavigateLogin={() => setState(AppState.AUTH_LOGIN)}
          onNavigateSignup={() => setState(AppState.AUTH_SIGNUP)}
          onLogout={handleLogout}
          user={user}
        >
          {renderHome()}
        </Layout>
      );
    
    case AppState.AUTH_LOGIN:
      return renderAuthForm(false);
    
    case AppState.AUTH_SIGNUP:
      return renderAuthForm(true);
    
    case AppState.INPUT:
      return (
        <Layout
          onNavigateHome={handleGoHome}
          onLogout={handleLogout}
          user={user}
        >
          <div className="flex flex-col lg:flex-row h-full gap-4 p-4">
            <div className="flex-1 lg:w-1/2">
              <ResumeForm onSubmit={handleSubmitResume} isLoading={isLoading} onBack={handleGoHome} />
            </div>
            {analysis && (
              <div className="flex-1 lg:w-1/2">
                <ResultsDashboard analysis={analysis} isLoading={isLoading} />
              </div>
            )}
          </div>
        </Layout>
      );
    
    case AppState.RESULTS:
      return (
        <Layout
          onNavigateHome={handleGoHome}
          onLogout={handleLogout}
          score={analysis?.score}
          user={user}
        >
          {analysis && <ResultsDashboard analysis={analysis} onBack={handleGoHome} />}
        </Layout>
      );
    
    case AppState.DASHBOARD:
      return (
        <Layout
          onNavigateHome={handleGoHome}
          onLogout={handleLogout}
          user={user}
        >
          <Dashboard
            history={history}
            onSelectAnalysis={handleViewAnalysis}
            onDeleteAnalysis={handleDeleteAnalysis}
            onBack={handleGoHome}
            userName={user?.name}
          />
        </Layout>
      );
    
    default:
      return null;
  }
};

export default App;
