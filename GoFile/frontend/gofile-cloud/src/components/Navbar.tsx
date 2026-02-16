import React from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { signOut } from 'aws-amplify/auth';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="h-16 bg-[#0b0f1a] border-b border-slate-800 flex items-center justify-between px-8 text-white sticky top-0 z-50">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
        <div className="bg-blue-600 p-2 rounded-lg">
          <span className="font-bold text-xl">G</span>
        </div>
        <span className="font-bold text-xl tracking-tight">GoFile</span>
      </div>

      <div className="flex items-center gap-6">
        <button onClick={() => navigate('/home')} className="text-sm font-medium text-blue-500">Home</button>
        
        {/* Logout Section only */}
        <div className="flex items-center gap-3 bg-slate-800/50 p-1.5 pl-3 pr-2 rounded-full border border-slate-700">
          <span className="text-xs font-medium text-slate-300">Profile</span>
          <button 
            onClick={handleLogout} 
            className="p-1 hover:bg-red-500/20 rounded-full transition-colors group"
            title="Sign Out"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>
    </header>
  );
}