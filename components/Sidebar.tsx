
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { User, Role } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const menuItems = [
    {
      id: 'rh',
      label: 'Recursos Humanos',
      icon: 'groups',
      role: 'Recursos Humanos' as Role,
      links: [
        { label: 'Funcionários', path: '/rh/employees' },
        { label: 'Candidatos', path: '/rh/candidates' },
        { label: 'Treinamentos', path: '/rh/training' },
      ]
    },
    {
      id: 'dp',
      label: 'Departamento Pessoal',
      icon: 'badge',
      role: 'Departamento Pessoal' as Role,
      links: [
        { label: 'Folha de Pagamento', path: '/dp/payroll' },
        { label: 'Benefícios', path: '/dp/benefits' },
        { label: 'Férias', path: '/dp/vacation' },
      ]
    },
    {
      id: 'comercial',
      label: 'Comercial',
      icon: 'storefront',
      role: 'Comercial' as Role,
      links: [
        { label: 'Escala', path: '/comercial/schedule' },
        { label: 'Cadastro de Clientes', path: '/comercial/clients' },
        { label: 'Cadastro de Filial', path: '/comercial/branches' },
        { label: 'Metas', path: '/comercial/goals' },
      ]
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: 'attach_money',
      role: 'Financeiro' as Role,
      links: [
        { label: 'Fluxo de Caixa', path: '/financeiro/cashflow' },
        { label: 'Contas a Pagar', path: '/financeiro/payable' },
        { label: 'Contas a Receber', path: '/financeiro/receivable' },
      ]
    },
    {
      id: 'controladoria',
      label: 'Controladoria',
      icon: 'analytics',
      role: 'Controladoria' as Role,
      links: [
        { label: 'Relatórios Fiscais', path: '/controladoria/reports' },
        { label: 'Auditoria', path: '/controladoria/audit' },
        { label: 'BI & Analytics', path: '/controladoria/bi' },
      ]
    }
  ];

  // Filter items: Admins see all, others see only their specific role item
  const filteredMenuItems = menuItems.filter(item => 
    user.role === "Admin" || user.role === item.role
  );

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-border-dark flex-shrink-0 overflow-y-auto no-scrollbar">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Geral</h3>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <span className="material-symbols-outlined">home</span>
            <span className="text-sm">Início</span>
          </NavLink>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Módulos do Sistema</h3>
          
          {filteredMenuItems.map(item => (
            <div key={item.id} className="flex flex-col">
              <button 
                onClick={() => toggleSubmenu(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  openSubmenu === item.id 
                    ? 'text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${openSubmenu === item.id ? 'text-primary' : ''}`}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${openSubmenu === item.id ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              
              <div className={`flex flex-col ml-9 mt-1 gap-1 border-l-2 border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 ${openSubmenu === item.id ? 'max-h-96' : 'max-h-0'}`}>
                {item.links.map(link => (
                  <NavLink 
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => 
                      `px-4 py-2 text-[13px] transition-all relative ${
                        isActive 
                          ? 'text-primary font-bold border-l-2 border-primary -ml-[2px] bg-primary/5 rounded-r-lg' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {user.role === "Admin" && (
            <NavLink 
              to="/configuracoes" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 mt-2 ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm">Configurações</span>
            </NavLink>
          )}
        </div>
      </div>

      <div className="mt-auto p-6">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/30"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Sair do sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
