import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FileDown, Layers, Scissors, Shrink, FileText, Clock, File } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">What do you want to do?</h1>
          <p className="text-slate-400 text-lg text-balance">Select a tool below to start processing your documents.</p>
        </div>

        {/* Tools Grid - 5 Major Tools */}
   
<div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-20">
  <ToolCard icon={<FileDown color="#3b82f6" />} label="Convert" onClick={() => navigate('/tools/convert')} />
  <ToolCard icon={<Layers color="#a855f7" />} label="Merge" onClick={() => navigate('/tools/merge')} />
  <ToolCard icon={<Scissors color="#f97316" />} label="Split" onClick={() => navigate('/tools/split')} />
  <ToolCard icon={<Shrink color="#22c55e" />} label="Compress" onClick={() => navigate('/tools/compress')} />
  <ToolCard icon={<FileText color="#ef4444" />} label="Summarize" onClick={() => navigate('/tools/summarize')} />
</div>

        {/* Recent Activity Section (Cleaned - No Upload Button) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xl font-semibold border-b border-slate-800 pb-4">
            <Clock className="text-blue-500" size={24} />
            <h2>Recent Activity</h2>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-800/50 p-6 rounded-full mb-6">
              <File size={48} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-2">No recent activity</h3>
            <p className="text-slate-500 max-w-sm">Once you use a tool, your processed files will appear here for 24 hours.</p>
            {/* 
               The "Upload your first file" button has been removed 
               as per your requirement. 
            */}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolCard({ icon, label, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#111827] border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 hover:bg-slate-800/40 transition-all cursor-pointer group text-center"
    >
      <div className="bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <span className="font-bold text-lg text-slate-200">{label}</span>
    </div>
  );
}