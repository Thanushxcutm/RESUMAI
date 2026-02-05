
import React, { useState } from 'react';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { extractTextFromImage } from '../services/geminiService';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Configure standard font data URL to fix font warnings
const pdfOptions = {
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
};

interface ResumeFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  initialText?: string;
  onBack?: () => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ onSubmit, isLoading, initialText = '', onBack }) => {
  const [text, setText] = useState(initialText);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 50) return;
    onSubmit(text);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      let extractedText = '';
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          ...pdfOptions
        });
        const pdf = await loadingTask.promise;
        let fullText = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText.push(content.items.map((it: any) => it.str).join(' '));
        }
        extractedText = fullText.join('\n');
      } else if (lowerName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (lowerName.endsWith('.txt')) {
        extractedText = await file.text();
      } else if (['.jpg', '.jpeg', '.png'].some(ext => lowerName.endsWith(ext))) {
        const base64 = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.readAsDataURL(file);
          r.onload = () => resolve((r.result as string).split(',')[1]);
        });
        extractedText = await extractTextFromImage(base64, file.type);
      }

      if (extractedText.trim()) setText(extractedText.trim());
    } catch (err) {
      alert("Extraction failed. Please try pasting the text manually.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-100 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)]">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back
            </button>
          )}
          <h2 className="font-poppins font-bold text-slate-800">Editor Workspace</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{text.length} Characters</span>
        </div>
      </div>

      <div className="flex-grow relative overflow-hidden flex flex-col">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your resume here..."
          className="flex-grow w-full p-8 text-slate-600 leading-relaxed font-medium resize-none focus:outline-none placeholder:text-slate-300"
        />
        
        <div className="p-6 bg-slate-50/50 border-t border-slate-50">
          <div className="flex items-center space-x-4">
            <div className="relative group flex-grow">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
              />
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl group-hover:border-indigo-300 transition-colors bg-white">
                {isProcessingFile ? (
                  <i className="fas fa-circle-notch fa-spin text-indigo-500 mr-2"></i>
                ) : (
                  <i className="fas fa-cloud-upload-alt text-slate-400 group-hover:text-indigo-500 mr-2"></i>
                )}
                <span className="text-sm font-semibold text-slate-500 group-hover:text-indigo-600">
                  {isProcessingFile ? 'Processing...' : 'Upload File'}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isLoading || text.trim().length < 50}
              className={`px-8 py-4 rounded-2xl font-bold text-white shadow-lg shadow-indigo-100 transition-all flex items-center space-x-2 ${
                isLoading || text.trim().length < 50
                  ? 'bg-slate-200 cursor-not-allowed shadow-none'
                  : 'gradient-bg hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isLoading ? (
                <i className="fas fa-sync fa-spin"></i>
              ) : (
                <>
                  <i className="fas fa-bolt text-amber-300"></i>
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;
