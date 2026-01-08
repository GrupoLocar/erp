
import React, { useState } from 'react';
import { User, Role } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const USERS_DB = [
  { name: "Admin", registration: "12345", password: "admin", role: "Admin" as Role, avatar: "https://picsum.photos/seed/admin/200" },
  { name: "Karen Monneratt", registration: "12346", password: "rh123", role: "Recursos Humanos" as Role, avatar: "https://picsum.photos/seed/karen/200" },
  { name: "Leonardo Lopes", registration: "12347", password: "dp123", role: "Departamento Pessoal" as Role, avatar: "https://picsum.photos/seed/leonardo/200" },
  { name: "Emmanoel Calito", registration: "12348", password: "contro123", role: "Controladoria" as Role, avatar: "https://picsum.photos/seed/emmanoel/200" },
  { name: "Emerson Cabral", registration: "12349", password: "finan123", role: "Financeiro" as Role, avatar: "https://picsum.photos/seed/emerson/200" },
  { name: "Lucas Diniz", registration: "12350", password: "comer123", role: "Comercial" as Role, avatar: "https://picsum.photos/seed/lucas/200" },
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [registration, setRegistration] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const foundUser = USERS_DB.find(u => u.registration === registration && u.password === password);
      
      if (foundUser) {
        onLogin({
          name: foundUser.name,
          registration: foundUser.registration,
          avatar: foundUser.avatar,
          role: foundUser.role
        });
      } else {
        setError('Matrícula ou senha incorretos.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-[1100px] h-auto md:h-[720px] bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-border-dark animate-in fade-in zoom-in-95 duration-500">
        
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-[28px] font-bold">grid_view</span>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">ERP System</span>
            </div>

            <div className="flex flex-col gap-2 mb-8">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Bem-vindo(a)
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Identifique-se para acessar
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Matrícula</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <input 
                    type="text" 
                    required
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                    placeholder="Sua matrícula"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Senha</label>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                    placeholder="Sua senha"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 transition-all transform active:scale-95 flex items-center justify-center disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Entrar'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Acesso restrito a colaboradores autorizados
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex w-1/2 relative bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-slate-900/90 z-10 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-20 opacity-90"></div>
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 hover:scale-110" 
            alt="Dashboard Background"
          />
          <div className="relative z-30 flex flex-col justify-end h-full p-12 lg:p-16 text-white">
            <div className="space-y-4 mb-10 max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[13px] font-bold tracking-tight">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                SISTEMA OPERACIONAL
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                Gestão simplificada para impulsionar resultados.
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed font-medium">
                Controle total sobre todos os departamentos em uma única plataforma intuitiva e segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
