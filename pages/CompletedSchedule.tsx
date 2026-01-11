import React from 'react';

const CompletedSchedule: React.FC = () => {
  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1200px] mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center text-xs font-bold uppercase tracking-widest text-slate-400">
          <span>Comercial</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg">Escala Concluída</span>
        </div>

        <div className="flex flex-wrap justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Escala Concluída
            </h1>
            <p className="text-lg text-slate-500 font-medium">Consulta e auditoria de escalas finalizadas</p>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-border-dark overflow-hidden p-8 md:p-10">
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Em desenvolvimento</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Esta rota foi adicionada para atender ao submenu <b>Escala Concluída</b>.
            A implementação completa (integração com backend, filtros, exportação, etc.) pode ser conectada aqui sem impactar a tela de Escala Programados.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CompletedSchedule;
