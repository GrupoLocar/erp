
import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 flex-shrink-0 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-20 shadow-sm relative">
      <div className="flex items-center gap-4">
        <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl font-bold">grid_view</span>
        </div>
        <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight hidden md:block">
          ERP Grupo Locar
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-primary/30 transition-all">
          <span className="material-symbols-outlined text-slate-500 text-sm">search</span>
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-slate-500 dark:text-white"
          />
        </div>

        <button className="text-slate-500 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-2xl">notifications</span>
        </button>

        <div 
          className="relative group flex items-center gap-3 cursor-pointer py-2"
          onMouseEnter={() => setShowProfileMenu(true)}
          onMouseLeave={() => setShowProfileMenu(false)}
        >
          <div className="flex flex-col items-end hidden sm:flex leading-tight">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Mat: {user.registration}</span>
          </div>
          <div 
            className="size-10 rounded-full bg-slate-200 bg-center bg-cover border border-slate-200 dark:border-slate-700 shadow-sm"
            style={{ backgroundImage: `url(${user.avatar})` }}
          />

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-slate-100 dark:border-border-dark overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-lg">person</span>
                Perfil
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-lg">settings</span>
                Preferências
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span className="material-symbols-outlined text-lg font-bold">logout</span>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
