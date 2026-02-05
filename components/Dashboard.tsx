import React from 'react';
import { HistoryItem } from '../services/storageService';
import { ResumeAnalysis } from '../types';

interface DashboardProps {
  history: HistoryItem[];
  onSelectAnalysis: (analysis: ResumeAnalysis) => void;
  onDeleteAnalysis: (id: string) => void;
  onBack: () => void;
  userName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onSelectAnalysis, onDeleteAnalysis, onBack, userName }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Home
        </button>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">Your Resume Analytics</h1>
              <p className="text-slate-500 text-lg mt-1">Track your resume improvements over time</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Analyses</p>
                <p className="text-4xl font-black text-slate-900">{history.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center">
                <i className="fas fa-file-lines text-2xl text-indigo-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Avg Impact Score</p>
                <p className="text-4xl font-black text-slate-900">
                  {history.length > 0 
                    ? Math.round(history.reduce((sum, item) => sum + item.analysis.score, 0) / history.length)
                    : 0}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center">
                <i className="fas fa-star text-2xl text-emerald-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Avg ATS Score</p>
                <p className="text-4xl font-black text-slate-900">
                  {history.length > 0 
                    ? Math.round(history.reduce((sum, item) => sum + item.analysis.atsScore, 0) / history.length)
                    : 0}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                <i className="fas fa-robot text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        {history.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Recent Analyses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Resume Preview</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Impact</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ATS Score</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">{formatDate(item.timestamp)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{truncateText(item.resumeText, 50)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
                              style={{ width: `${item.analysis.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{item.analysis.score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                          {item.analysis.atsScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onSelectAnalysis(item.analysis)}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View analysis"
                          >
                            <i className="fas fa-eye mr-1"></i> View
                          </button>
                          <button
                            onClick={() => onDeleteAnalysis(item.id)}
                            className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete analysis"
                          >
                            <i className="fas fa-trash mr-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <i className="fas fa-inbox text-3xl text-slate-400"></i>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No analyses yet</h3>
            <p className="text-slate-500 text-lg">Upload your first resume to get started with AI-powered analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
