
import React, { useState, useMemo } from 'react';
import { Employee, EmployeeStatus, CNHStatus } from '../types';

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Joao Silva',
    city: 'São Paulo',
    status: EmployeeStatus.ACTIVE,
    phone: '(11) 99999-9999',
    age: 34,
    birthDate: '1990-05-15',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    cnhNumber: '00123456789',
    cnhCategories: ['A', 'B'],
    cnhExpiry: '2023-10-01',
    cnhStatus: CNHStatus.EXPIRED,
    cnhDaysRemaining: -5,
    address: { cep: '01001-000', street: 'Praça da Sé', number: '100' }
  },
  {
    id: '2',
    name: 'Maria Souza',
    city: 'Rio de Janeiro',
    status: EmployeeStatus.ACTIVE,
    phone: '(21) 98888-8888',
    age: 29,
    birthDate: '1995-03-20',
    cpf: '234.567.890-11',
    rg: '23.456.789-0',
    cnhNumber: '00234567890',
    cnhCategories: ['B'],
    cnhExpiry: '2024-10-01',
    cnhStatus: CNHStatus.VALID,
    cnhDaysRemaining: 120,
    address: { cep: '20010-000', street: 'Rua Primeiro de Março', number: '50' }
  },
  {
    id: '3',
    name: 'Carlos Pereira',
    city: 'Curitiba',
    status: EmployeeStatus.VACATION,
    phone: '(41) 97777-7777',
    age: 42,
    birthDate: '1982-07-10',
    cpf: '345.678.901-22',
    rg: '34.567.890-1',
    cnhNumber: '00345678901',
    cnhCategories: ['D'],
    cnhExpiry: '2023-10-15',
    cnhStatus: CNHStatus.EXPIRING,
    cnhDaysRemaining: 15,
    address: { cep: '80010-000', street: 'Rua XV de Novembro', number: '10' }
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    city: 'Belo Horizonte',
    status: EmployeeStatus.INACTIVE,
    phone: '(31) 96666-6666',
    age: 30,
    birthDate: '1994-11-25',
    cpf: '456.789.012-33',
    rg: '45.678.901-2',
    cnhNumber: '00456789012',
    cnhCategories: ['B', 'D'],
    cnhExpiry: '2025-05-10',
    cnhStatus: CNHStatus.VALID,
    cnhDaysRemaining: 300,
    address: { cep: '30010-000', street: 'Praça da Liberdade', number: '200' }
  }
];

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus | 'All'>('All');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, selectedStatus]);

  const getStatusBadge = (status: EmployeeStatus) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm";
    switch (status) {
      case EmployeeStatus.ACTIVE: return `${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300`;
      case EmployeeStatus.VACATION: return `${baseClasses} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300`;
      case EmployeeStatus.INACTIVE: return `${baseClasses} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400`;
      case EmployeeStatus.BLOCKED: return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`;
      default: return `${baseClasses} bg-slate-100 text-slate-700`;
    }
  };

  const getCNHBadge = (status: CNHStatus) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border";
    switch (status) {
      case CNHStatus.VALID: return `${baseClasses} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800`;
      case CNHStatus.EXPIRING: return `${baseClasses} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800`;
      case CNHStatus.EXPIRED: return `${baseClasses} bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800`;
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cadastro de Funcionários</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span>Gestão de Recursos Humanos</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary">Funcionários</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-border-dark space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="w-full lg:max-w-md relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
            <input 
              type="text" 
              placeholder="Filtrar por nome ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
              <span className="material-symbols-outlined text-xl">filter_list</span>
              Limpar
            </button>
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95">
              <span className="material-symbols-outlined text-xl">add</span>
              Novo Registro
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex justify-between">
              Situação <span>Multiselect</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {['All', ...Object.values(EmployeeStatus)].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedStatus === status 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-border-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Nome Completo</th>
                <th className="px-6 py-4">Cidade</th>
                <th className="px-6 py-4">Situação</th>
                <th className="px-6 py-4">Idade</th>
                <th className="px-6 py-4">Status CNH</th>
                <th className="px-6 py-4 text-right">Dias CNH</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</span>
                      <span className="text-xs font-medium text-slate-400">{emp.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{emp.city}</td>
                  <td className="px-6 py-5">
                    <span className={getStatusBadge(emp.status)}>{emp.status}</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-slate-400">{emp.age}</td>
                  <td className="px-6 py-5">
                    <span className={getCNHBadge(emp.cnhStatus)}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        emp.cnhStatus === CNHStatus.VALID ? 'bg-blue-500' : 
                        emp.cnhStatus === CNHStatus.EXPIRING ? 'bg-amber-500' : 'bg-red-500'
                      }`}></span>
                      {emp.cnhStatus}
                    </span>
                  </td>
                  <td className={`px-6 py-5 text-sm font-black text-right ${
                    emp.cnhDaysRemaining < 0 ? 'text-red-500' : 
                    emp.cnhDaysRemaining < 30 ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    {emp.cnhDaysRemaining}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setEditingEmployee(emp)}
                        className="size-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg font-bold">edit</span>
                      </button>
                      <button className="size-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <span className="material-symbols-outlined text-lg font-bold">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Exibindo {filteredEmployees.length} de {employees.length} funcionários
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50">Próximo</button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {editingEmployee && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setEditingEmployee(null)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 sm:pl-16">
            <div className="w-screen max-w-4xl bg-white dark:bg-surface-dark shadow-2xl flex flex-col h-full animate-slide-in-right">
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-border-dark flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Editar Funcionário</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {editingEmployee.id}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
                    <button className="size-8 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-lg">first_page</span></button>
                    <button className="size-8 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
                    <span className="px-3 text-xs font-black text-slate-900 dark:text-white">5 / 150</span>
                    <button className="size-8 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
                    <button className="size-8 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-lg">last_page</span></button>
                  </div>
                  <button onClick={() => setEditingEmployee(null)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 bg-white dark:bg-surface-dark sticky top-0 z-10">
                <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800">
                  {['Identificação', 'Acesso', 'Pessoais', 'Endereço', 'Profissionais', 'CNH', 'Anexos'].map((tab, i) => (
                    <button key={tab} className={`pb-4 pt-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 dark:bg-slate-900">
                {/* Section: Identificação */}
                <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 border border-slate-100 dark:border-border-dark shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Identificação do Funcionário</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input type="text" defaultValue={editingEmployee.name} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data Nascimento</label>
                      <div className="relative">
                        <input type="date" defaultValue={editingEmployee.birthDate} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-900 dark:text-white pr-20" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-black text-slate-500 uppercase">{editingEmployee.age} anos</span>
                      </div>
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">CPF</label>
                      <input type="text" defaultValue={editingEmployee.cpf} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">RG</label>
                      <input type="text" defaultValue={editingEmployee.rg} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Situação</label>
                      <select defaultValue={editingEmployee.status} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-900 dark:text-white">
                        {Object.values(EmployeeStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: CNH */}
                <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 border border-slate-100 dark:border-border-dark shadow-sm relative overflow-hidden space-y-6">
                  <div className="absolute top-8 right-8">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 ${
                      editingEmployee.cnhStatus === CNHStatus.EXPIRED ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      STATUS: {editingEmployee.cnhStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Dados da Habilitação (CNH)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nº Registro</label>
                      <input type="text" defaultValue={editingEmployee.cnhNumber} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['A', 'B', 'C', 'D'].map(cat => (
                          <button key={cat} className={`h-12 flex items-center justify-center rounded-xl border-2 font-black transition-all ${
                            editingEmployee.cnhCategories.includes(cat) 
                              ? 'bg-primary/10 border-primary text-primary' 
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                          }`}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Validade</label>
                      <div className="space-y-1">
                        <input type="date" defaultValue={editingEmployee.cnhExpiry} className={`w-full h-12 border-2 rounded-2xl font-bold px-4 ${
                          editingEmployee.cnhDaysRemaining < 0 
                            ? 'bg-red-50 border-red-100 text-red-600 focus:ring-red-100 focus:border-red-400' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                        }`} />
                        {editingEmployee.cnhDaysRemaining < 0 && (
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1">Expirou há {Math.abs(editingEmployee.cnhDaysRemaining)} dias</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Endereço */}
                <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 border border-slate-100 dark:border-border-dark shadow-sm space-y-6">
                   <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Endereço</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                      <div className="relative group">
                        <input type="text" defaultValue={editingEmployee.address.cep} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-900 dark:text-white pr-12" />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"><span className="material-symbols-outlined">search</span></button>
                      </div>
                    </div>
                    <div className="md:col-span-6 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Logradouro</label>
                      <input type="text" readOnly defaultValue={editingEmployee.address.street} className="w-full h-12 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-400 cursor-not-allowed" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nº</label>
                      <input type="text" defaultValue={editingEmployee.address.number} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-900 dark:text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-border-dark flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Última atualização: 10/10/2023 por Admin</p>
                <div className="flex gap-4">
                  <button onClick={() => setEditingEmployee(null)} className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 transition-all">Cancelar</button>
                  <button onClick={() => setEditingEmployee(null)} className="px-10 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95">Salvar Alterações</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
