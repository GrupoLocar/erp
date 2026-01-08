
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
    <div className="relative h-full overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1600" 
          className="w-full h-full object-cover"
          alt="Professional Management Team"
        />
      </div>

      <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mt-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-black uppercase tracking-widest shadow-xl">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Acesso: {user.role}
            </div>
            <div className="space-y-2">
              <h2 className="text-slate-200 text-lg font-bold tracking-widest uppercase">Dashboard Principal</h2>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                Olá, {user.name.split(' ')[0]}!
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-3xl shadow-2xl">
              <span className="material-symbols-outlined text-white text-3xl">calendar_today</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Data de hoje</span>
                <span className="text-xl font-bold text-white tracking-tight">{formatDate(time)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-3xl shadow-2xl">
              <span className="material-symbols-outlined text-white text-3xl">schedule</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Hora atual</span>
                <span className="text-xl font-bold text-white tracking-tight">{formatTime(time)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            {[
              { label: 'Matrícula', value: user.registration, icon: 'badge', color: 'bg-primary' },
              { label: 'Status Sistema', value: 'Online', icon: 'check_circle', color: 'bg-emerald-500' },
              { label: 'Suporte TI', value: 'Ramal 200', icon: 'support_agent', color: 'bg-slate-600' },
            ].map((stat, i) => (
              <div key={i} className="group cursor-pointer bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 transition-all transform hover:-translate-y-1">
                <div className={`size-12 rounded-2xl ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <div className="text-2xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
                <div className="text-sm font-bold text-white/60 tracking-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
