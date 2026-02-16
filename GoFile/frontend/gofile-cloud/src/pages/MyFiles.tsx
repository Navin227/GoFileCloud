import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Folder, Image, FileText, Video, Music, Search, Home, Clock, Star, Trash2 } from 'lucide-react';

export default function MyFiles() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Function to trigger hidden file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 2. Function to handle file selection
  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      alert(`Selected file: ${files[0].name}. Ready to connect to S3!`);
      // Yahan hum baad mein apna AWS S3 upload logic daalenge
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileSelect} 
        className="hidden" 
        multiple 
      />

      {/* --- Sidebar --- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <span className="font-bold text-xl">G</span>
          </div>
          <span className="font-bold text-xl tracking-tight">GoFile</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<Home size={20}/>} label="Home" onClick={() => navigate('/recent')} />
          <NavItem icon={<Folder size={20}/>} label="My Files" active onClick={() => navigate('/my-files')} />
          <NavItem icon={<Clock size={20}/>} label="Recent" onClick={() => navigate('/recent')} />
          <NavItem icon={<Star size={20}/>} label="Starred" onClick={() => navigate('/my-files')} />
          <NavItem icon={<Trash2 size={20}/>} label="Trash" onClick={() => navigate('/my-files')} />
          <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Tools</div>
          <NavItem icon={<FileText size={20}/>} label="Converter" onClick={() => navigate('/tools/converter')} />
          <NavItem icon={<Upload size={20}/>} label="Summarizer" onClick={() => navigate('/tools/summarizer')} />
        </nav>

        <div className="p-4 border-t border-gray-100 text-xs text-gray-500">
          Storage: 4.2 GB of 15 GB
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '30%' }}></div>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Search files..." className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleUploadClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Upload</button>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">US</div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-bold mb-6">My Files</h1>

          {/* Upload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div 
              onClick={handleUploadClick}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer group"
            >
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition"><Upload size={32} /></div>
              <h3 className="font-semibold text-lg">Upload Files</h3>
              <p className="text-gray-500 text-sm">Select files from your device</p>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition cursor-pointer group">
              <div className="bg-orange-100 p-4 rounded-full text-orange-600 mb-4 group-hover:scale-110 transition"><Folder size={32} /></div>
              <h3 className="font-semibold text-lg">New Folder</h3>
              <p className="text-gray-500 text-sm">Create a new directory</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CategoryCard icon={<Image className="text-purple-600"/>} label="Images" />
            <CategoryCard icon={<FileText className="text-blue-600"/>} label="Documents" />
            <CategoryCard icon={<Video className="text-red-600"/>} label="Videos" />
            <CategoryCard icon={<Music className="text-green-600"/>} label="Audio" />
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components for cleaner code
function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {icon} <span className="font-medium text-sm">{label}</span>
    </div>
  );
}

function CategoryCard({ icon, label }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 hover:shadow-md transition cursor-pointer">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}