import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Folder, Home, Clock, Star, Trash2, FileText, Upload } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to check which page is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
        <div className="bg-blue-600 p-2 rounded-lg text-white font-bold text-xl">G</div>
        <span className="font-bold text-xl">GoFile</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {/* AB YE BUTTONS SAHI RAASTE PE JAYENGE */}
        <SideItem 
          icon={<Home size={20}/>} 
          label="Home" 
          active={isActive('/home')} 
          onClick={() => navigate('/home')} 
        />
        <SideItem 
          icon={<Folder size={20}/>} 
          label="My Files" 
          active={isActive('/my-files')} 
          onClick={() => navigate('/my-files')} 
        />
        <SideItem 
          icon={<Clock size={20}/>} 
          label="Recent" 
          active={isActive('/recent')} 
          onClick={() => navigate('/recent')} 
        />
        <SideItem icon={<Star size={20}/>} label="Starred" onClick={() => {}} />
        <SideItem icon={<Trash2 size={20}/>} label="Trash" onClick={() => {}} />

        <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-400 uppercase">Tools</div>
        <SideItem icon={<FileText size={20}/>} label="Converter" onClick={() => navigate('/tools/converter')} />
        <SideItem icon={<Upload size={20}/>} label="Summarizer" onClick={() => navigate('/tools/summarizer')} />
      </nav>
    </aside>
  );
}

function SideItem({ icon, label, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon} <span className="font-medium text-sm">{label}</span>
    </div>
  );
}