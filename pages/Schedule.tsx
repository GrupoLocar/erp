
import React, { useState, useRef } from 'react';
import { ScheduleRecord } from '../types';

// Helper to generate 24h time slots in 30min intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
};

const TIME_OPTIONS = generateTimeSlots();

// Sample data to simulate spreadsheet processing
const SIMULATED_DATA: ScheduleRecord[] = [
  { id: '1', loc: 'LOCK3Z2Y', date: '12/11/2023', startTime: '08:00', branch: 'AASDU', operator: 'Leonardo Perez', status: 'ok' },
  { id: '2', loc: 'LOCVIYES', date: '12/11/2023', startTime: '14:00', branch: 'AAVIX', operator: 'Maria Oliveira', status: 'ok' },
  { id: '3', loc: 'LOC1MP8R', date: '13/11/2023', startTime: '07:30', branch: 'VCRJB', operator: 'Carlos Almeida', status: 'ok' },
  { id: '4', loc: 'LOC1D6LQ', date: '13/11/2023', startTime: '16:00', branch: 'VCVRE', operator: 'Fernanda Gomes', status: 'ok' },
  { id: '5', loc: 'LOC37LW0', date: '14/11/2023', startTime: '09:00', branch: 'ACSMA', operator: 'Roberto Pereira', status: 'ok' },
];

const Schedule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [records, setRecords] = useState<ScheduleRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (!fileName) {
      fileInputRef.current?.click();
      return;
    }
    
    setLoading(true);
    // Simulate processing the spreadsheet file
    setTimeout(() => {
      setLoading(false);
      setUploaded(true);
      setRecords(SIMULATED_DATA);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploaded(false);
      setRecords([]); // Clear table when new file is selected but not yet "loaded"
      
      // Automatically trigger upload simulation once file is picked
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setUploaded(true);
        setRecords(SIMULATED_DATA);
      }, 1000);
    }
  };

  const handleTimeChange = (id: string, newTime: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, startTime: newTime } : r));
  };

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1200px] mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center text-xs font-bold uppercase tracking-widest text-slate-400">
          <span>Comercial</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg">Escala</span>
        </div>
        
        <div className="flex flex-wrap justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Escala de Movimentadores
            </h1>
            <p className="text-lg text-slate-500 font-medium">Gerencie a escala da equipe de movimentadores</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <section className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-border-dark overflow-hidden p-8 md:p-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                Planilha de agendamento
              </h2>
              <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                Selecione o arquivo para importar. O sistema processará os dados automaticamente. <br/>
                <span className="font-bold text-slate-900 dark:text-slate-300">Colunas esperadas:</span> <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-primary font-mono text-xs">Loc</code>, <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-primary font-mono text-xs">Data</code>, <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-primary font-mono text-xs">Início</code>, <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-primary font-mono text-xs">Filial</code>, <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-primary font-mono text-xs">Movimentador</code>
              </p>
            </div>
            
            {uploaded && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800 text-xs font-black uppercase tracking-widest animate-in zoom-in-95">
                <span className="material-symbols-outlined text-[20px] font-bold">check_circle</span>
                Carregada com sucesso
              </div>
            )}
          </div>

          <div className="relative group">
            <div className="flex items-stretch bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden focus-within:border-primary/50 transition-all">
              <div className="flex items-center justify-center px-6 text-slate-400 bg-white dark:bg-slate-900/50 border-r-2 border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-3xl">folder_open</span>
              </div>
              <input 
                type="file" 
                id="file-upload"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden" 
              />
              <label 
                htmlFor="file-upload"
                className="flex-1 flex items-center px-6 py-4 cursor-pointer text-slate-500 font-bold hover:text-primary transition-colors"
              >
                {fileName || 'Clique para selecionar a planilha...'}
              </label>
              <button 
                onClick={handleUpload}
                disabled={loading}
                className="px-10 bg-primary hover:bg-primary-hover disabled:bg-slate-400 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center min-w-[160px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (fileName ? 'Carregar' : 'Selecionar')}
              </button>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 ml-1">Arquivos permitidos: .xlsx, .xls (Máx. 5MB)</p>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Visualização dos registros {records.length > 0 ? `(${records.length})` : ''}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setRecords([])}
              className="size-10 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 transition-all"
              title="Limpar Tabela"
            >
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
            <button className="size-10 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-border-dark overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            {records.length > 0 ? (
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5">Loc</th>
                    <th className="px-8 py-5 text-center">Data</th>
                    <th className="px-8 py-5 text-center">Início</th>
                    <th className="px-8 py-5">Filial</th>
                    <th className="px-8 py-5">Movimentador</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {records.map((rec, i) => (
                    <tr key={rec.id} className={`${i % 2 === 0 ? 'bg-white dark:bg-surface-dark' : 'bg-slate-50/30 dark:bg-slate-800/20'} hover:bg-primary/5 transition-colors group`}>
                      <td className="px-8 py-6">
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl text-xs font-black font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{rec.loc}</span>
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-bold text-slate-500">{rec.date}</td>
                      <td className="px-8 py-6 text-center">
                        <div className="relative inline-block w-32">
                          <select 
                            value={rec.startTime}
                            onChange={(e) => handleTimeChange(rec.id, e.target.value)}
                            className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black font-mono focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                          >
                            {TIME_OPTIONS.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-700 dark:text-slate-300">{rec.branch}</td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-900 dark:text-white underline decoration-slate-200 dark:decoration-slate-700 underline-offset-4">{rec.operator}</td>
                      <td className="px-8 py-6 text-right">
                        <span className="inline-block size-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-8 text-center space-y-4">
                <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                  <span className="material-symbols-outlined text-5xl">table_chart_off</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-slate-400">Nenhum dado carregado</p>
                  <p className="text-sm text-slate-500 max-w-sm">Importe uma planilha acima para visualizar os agendamentos da equipe.</p>
                </div>
              </div>
            )}
          </div>
          {records.length > 0 && (
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mostrando {records.length} registros</span>
              <div className="flex gap-2">
                <button className="px-6 py-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-[11px] font-black uppercase text-slate-400 disabled:opacity-50" disabled>Anterior</button>
                <button className="px-6 py-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-[11px] font-black uppercase text-slate-700 dark:text-white hover:bg-slate-50">Próximo</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Schedule;
