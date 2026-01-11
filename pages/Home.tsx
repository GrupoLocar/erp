import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface HomeProps {
  user: User;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="h-[300px] w-full flex items-start">
          <img
            src="/server/src/public/Fundo.jpg"
            alt="Fundo"
            className="max-w-full max-h-full object-contain ml-[50px] mt-[50px]"
          />
        </div>
      </div>

      <div className="-mt-10 p-8 md:p-12 lg:p-16 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-slate-200/20 rounded-full text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest shadow-xl">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Acesso: {user.role}
            </div>

            <div className="space-y-2">
              <h2 className="text-slate-600 dark:text-slate-200 text-lg font-bold tracking-widest uppercase">
                Dashboard Principal
              </h2>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                Olá, {user.name.split(' ')[0]}!
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark px-6 py-4 rounded-3xl shadow-xl">
              <span className="material-symbols-outlined text-slate-900 dark:text-white text-3xl">
                calendar_today
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Data de hoje
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {formatDate(time)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark px-6 py-4 rounded-3xl shadow-xl">
              <span className="material-symbols-outlined text-slate-900 dark:text-white text-3xl">
                schedule
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Hora atual
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {formatTime(time)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
