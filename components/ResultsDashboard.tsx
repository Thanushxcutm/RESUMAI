
import React, { useState } from 'react';
import { ResumeAnalysis } from '../types';

interface ResultsDashboardProps {
  analysis: ResumeAnalysis;
  isLoading?: boolean;
  onBack?: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ analysis, isLoading, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'skills' | 'jobs' | 'improvements'>('summary');

  if (isLoading) {
    return (
      <div className="h-full p-8 space-y-8 animate-pulse bg-white">
        <div className="h-4 bg-slate-100 rounded w-1/4 mb-10"></div>
        <div className="h-40 bg-slate-50 border border-slate-100 rounded-3xl w-full"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-slate-50 border border-slate-100 rounded-2xl"></div>
          <div className="h-32 bg-slate-50 border border-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 p-10 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 p-8 opacity-10">
                <i className="fas fa-shield-halved text-8xl"></i>
              </div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                  <i className="fas fa-microchip"></i>
                </div>
                <h3 className="font-poppins font-black text-xl uppercase tracking-widest text-indigo-300">Market Evaluation</h3>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed font-medium">{analysis.summary}</p>
              
              <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">Impact Score</span>
                  <span className="text-4xl font-black text-white">{analysis.score}<span className="text-indigo-500 text-xl">/100</span></span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">ATS Score</span>
                  <span className="text-4xl font-black text-white">{analysis.atsScore}<span className="text-indigo-500 text-xl">/100</span></span>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50/80 border-2 border-indigo-100 p-8 rounded-[32px]">
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-gavel text-indigo-600"></i>
                <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">Recruiter Audit Audit</h4>
              </div>
              <p className="text-indigo-900 leading-relaxed font-bold text-lg italic">"{analysis.advisorNote}"</p>
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm">
              <h3 className="font-poppins font-black text-xl text-slate-800 mb-8 uppercase tracking-widest text-sm">Detected Core Tech</h3>
              <div className="flex flex-wrap gap-2.5">
                {analysis.skills.map((s, i) => (
                  <span key={i} className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:border-indigo-300 transition-colors">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            
            {analysis.missingSkills.length > 0 && (
              <div className="p-8 rounded-[32px] bg-rose-50 border-2 border-rose-100">
                <h3 className="font-poppins font-black text-sm mb-6 text-rose-700 uppercase tracking-widest">Industry Gaps Detected</h3>
                <div className="flex flex-wrap gap-3">
                  {analysis.missingSkills.map((s, i) => (
                    <span key={i} className="px-4 py-2 bg-white rounded-xl text-[11px] font-black border border-rose-200 text-rose-600 flex items-center shadow-sm">
                      <i className="fas fa-triangle-exclamation mr-2 opacity-50"></i> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'jobs':
        return (
          <div className="grid grid-cols-1 gap-4 animate-fadeIn">
            {analysis.job_matches.map((job, i) => (
              <div key={i} className="bg-white border border-slate-200 p-8 rounded-[32px] hover:border-indigo-400 transition-all shadow-sm group">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-slate-900 text-xl group-hover:text-indigo-600 tracking-tight">{job.role}</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fit Confidence</span>
                    <span className="text-2xl font-black text-slate-900">{job.fit_score}%</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">"{job.reason}"</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'improvements':
        return (
          <div className="space-y-6 animate-fadeIn">
            {analysis.improvements.map((imp, i) => (
              <div key={i} className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">{i + 1}</span>
                  <h4 className="font-black text-slate-900 text-lg">{imp.issue}</h4>
                </div>
                <p className="text-sm text-slate-500 mb-6 ml-11 font-medium">{imp.suggestion}</p>
                {imp.example_fix && (
                  <div className="bg-indigo-900 p-6 rounded-2xl text-xs font-mono text-indigo-100 shadow-xl ml-11">
                    <span className="text-[10px] font-black text-indigo-400 block mb-3 uppercase tracking-[0.2em]">Google XYZ Recommendation</span>
                    {imp.example_fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-8 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center text-indigo-600 hover:text-indigo-700 font-bold transition-colors mb-4"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back
          </button>
        )}
        <div className="flex space-x-8 flex-1">
          {[
            { id: 'summary', label: 'Audit' },
            { id: 'skills', label: 'Tech Stack' },
            { id: 'jobs', label: 'Targets' },
            { id: 'improvements', label: 'Critical Fixes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-6 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-b-4 ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-grow p-8 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ResultsDashboard;
