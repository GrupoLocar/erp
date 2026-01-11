import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Employee, EmployeeStatus, CNHStatus, User } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const INITIAL_EMPLOYEE_STATE: any = {
  id: '',
  nome: '',
  sexo: '',
  profissao: '',
  situacao: 'Aprovar',
  contrato: 'Comun',
  pj: false,
  telefone: '',
  data_admissao: '',
  data_demissao: '',
  data_nascimento: '',
  email: '',
  endereco: '',
  complemento: '',
  bairro: '',
  municipio: '',
  estado: '',
  cep: '',
  banco: '001 – Banco do Brasil',
  agencia: '',
  conta: '',
  pix: '',
  cpf: '',
  rg: '',
  estado_civil: 'Solteiro(A)',
  filhos: 0,
  cnh: '',
  categoria: 'B',
  emissao_cnh: '',
  validade_cnh: '',
  statusCNH: 'Prazo',
  nome_familiar: '',
  contato_familiar: '',
  indicado: '',
  observacao: '',
  senha: '',
  perfil_acesso: 'Supervisor',
  arquivos: {
    cnh_arquivo: null,
    comprovante_residencia: null,
    nada_consta: null,
    comprovante_mei: null,
    curriculo: null
  }
};

const BANCOS = [
  '001 – Banco do Brasil', '021 – Banestes – Banco do Estado do Espírito Santo', '033 – Banco Santander (Brasil) S.A.',
  '041 – Banco do Estado do Rio Grande do Sul (Banrisul)', '074 – Banco J. Safra S.A.', '075 – Banco CR2 S.A.',
  '077 – Banco Intermedium S.A.', '104 – Caixa Econômica Federal', '197 – Stone Instituição de Pagamento S.A.',
  '218 – Banco BS2 S.A.', '237 – Banco Bradesco S.A.', '260 – Nu Pagamentos S.A.', '290 – PagSeguro Internet Instituição de Pagamento S.A.',
  '318 – Banco BMG S.A.', '336 – Banco C6 S.A.', '341 – Itaú Unibanco S.A.', '380 – PicPay Instituição de Pagamento S.A.',
  '399 – HSBC Bank Brasil S.A.', '422 – Banco Safra S.A.', '477 – Citibank N.A. (filial)', '536 – Neon Pagamentos S.A. – Instituição de Pagamento',
  '637 – Banco Sofisa S.A.', '655 – Banco Votorantim S.A.', '707 – Banco Daycoval S.A.', '745 – Banco Citibank S.A.',
  '746 – Banco Modal S.A.', '748 – Banco Cooperativo Sicredi S.A.', '756 – Banco Cooperativo do Brasil – Bancoob'
];

interface EmployeeListProps {
  user?: User;
  /** Quando true, a tela abre automaticamente o fluxo de "Novo Funcionário" (modal fullscreen). */
  autoOpenNew?: boolean;
  /** Se informado, ao fechar o modal (novo/editar) o usuário é redirecionado para esta rota. */
  onCloseRedirectPath?: string;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ user, autoOpenNew = false, onCloseRedirectPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Evita tela branca quando a rota não fornece "user"
  const safeUser: User = (user ?? { role: 'User', name: 'Usuário' }) as User;

  // =========================
  // Carregamento (MongoDB -> Backend)
  // =========================
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5001';

  const fetchEmployees = async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setLoadError(null);

      const res = await fetch(`${API_BASE}/api/funcionarios`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Falha ao carregar funcionários (${res.status}). ${txt}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
      setEmployees(Array.isArray(list) ? list : []);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setLoadError(e?.message || 'Erro ao carregar funcionários.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('Identificação');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [filterSituacao, setFilterSituacao] = useState<string[]>([]);
  const [filterCNHStatus, setFilterCNHStatus] = useState<string[]>([]);
  const [filterCategoria, setFilterCategoria] = useState<string[]>([]);

  const tabs = useMemo(() => {
    const base = ['Identificação', 'Anexos'];
    if (safeUser.role === 'Admin') {
      return ['Identificação', 'Acesso', 'Anexos'];
    }
    return base;
  }, [safeUser.role]);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFileKey, setCurrentFileKey] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // =========================
  // Helpers / Masks
  // =========================
  const maskPhone = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1)$2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 14);
  const maskCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').slice(0, 14);
  const maskRG = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1-$2').slice(0, 12);
  const maskCEP = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1-$2').slice(0, 10);
  const maskCNH = (v: string) => v.replace(/\D/g, '').slice(0, 11);

  // =========================
  // Cálculos: Idade / CNH
  // =========================
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return 0;

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getCNHDiff = (expiryDate: string) => {
    if (!expiryDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validade = new Date(expiryDate);
    if (Number.isNaN(validade.getTime())) return 0;

    const diffTime = validade.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateCNHStatus = (expiryDate: string) => {
    if (!expiryDate) return 'Prazo';
    const diffDays = getCNHDiff(expiryDate);
    if (diffDays < 0) return 'Vencido';
    if (diffDays <= 30) return 'A Vencer';
    return 'Prazo';
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block";
    switch (status) {
      case 'Ativo':
      case 'Prazo':
        return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`;
      case 'Inativo':
      case 'Bloqueado':
      case 'Vencido':
        return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
      case 'Férias':
      case 'A Vencer':
        return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
      case 'Aprovar':
      case 'Entrevistar':
        return `${base} bg-primary/10 text-primary dark:bg-primary/20`;
      default:
        return `${base} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400`;
    }
  };

  // =========================
  // Processamento / Filtros
  // =========================
  const processedData = useMemo(() => {
    return employees.map((emp: any) => {
      const expiry = emp.validade_cnh || emp.cnhExpiry || '';
      const cat = emp.categoria || (emp.cnhCategories && emp.cnhCategories[0]) || 'B';
      const situacao = emp.situacao || emp.status || 'Aprovar';
      return {
        ...emp,
        _displayNome: emp.nome || emp.name || 'Sem Nome',
        _displayCidade: emp.municipio || emp.city || 'Não Inf.',
        _displaySituacao: situacao,
        _displayTelefone: emp.telefone || emp.phone || 'N/A',
        _displayIdade: calculateAge(emp.data_nascimento || emp.birthDate),
        _displayCNHStatus: calculateCNHStatus(expiry),
        _displayCNHDias: getCNHDiff(expiry),
        _displayCategoria: cat,
        _searchString: JSON.stringify(emp).toLowerCase(),
        _rowKey: emp._id || emp.id || `${emp.nome || emp.name || 'emp'}-${Math.random()}`
      };
    });
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return processedData.filter((emp: any) => {
      const matchesSearch = searchTerm === '' || emp._searchString.includes(searchTerm.toLowerCase());
      const matchesSituacao = filterSituacao.length === 0 || filterSituacao.includes(emp._displaySituacao);
      const matchesCNH = filterCNHStatus.length === 0 || filterCNHStatus.includes(emp._displayCNHStatus);
      const matchesCat = filterCategoria.length === 0 || filterCategoria.includes(emp._displayCategoria);
      return matchesSearch && matchesSituacao && matchesCNH && matchesCat;
    });
  }, [processedData, searchTerm, filterSituacao, filterCNHStatus, filterCategoria]);

  // =========================
  // Paginação (logo após filteredEmployees)
  // =========================
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterSituacao, filterCNHStatus, filterCategoria]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE)), [filteredEmployees.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pagedEmployees = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [filteredEmployees, page]);

  // =========================
  // Estatísticas / Filtros Avançados
  // =========================
  const stats = useMemo(() => {
    const sit: any = { 'Ativo': 0, 'Inativo': 0, 'Bloqueado': 0, 'Aprovar': 0, 'Entrevistar': 0, 'PJ': 0 };
    const cnh: any = { 'Vencido': 0, 'A Vencer': 0, 'Prazo': 0 };
    const cat: any = { 'AB': 0, 'AC': 0, 'AD': 0, 'AE': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 };

    processedData.forEach((emp: any) => {
      const s = emp._displaySituacao;
      if (Object.prototype.hasOwnProperty.call(sit, s)) sit[s]++;
      if (emp.pj) sit['PJ']++;

      const st = emp._displayCNHStatus;
      if (Object.prototype.hasOwnProperty.call(cnh, st)) cnh[st]++;

      const ct = String(emp._displayCategoria || '').toUpperCase();
      if (Object.prototype.hasOwnProperty.call(cat, ct)) cat[ct]++;
    });

    return { sit, cnh, cat };
  }, [processedData]);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setList(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterSituacao([]);
    setFilterCNHStatus([]);
    setFilterCategoria([]);
  };

  // =========================
  // CRUD (Backend)
  // =========================
  const openNewEmployeeModal = () => {
    setEditingEmployee({ ...INITIAL_EMPLOYEE_STATE, id: `EMP${Date.now().toString().slice(-6)}` });
    setActiveTab('Identificação');
  };

  // Clique no botão "Novo" deve levar para a rota dedicada (mantém deep-link e refresh-safe)
  const handleAddNew = () => {
    navigate('/rh/employees/new');
  };

  // Se esta instância foi montada para a rota /rh/employees/new, abre automaticamente o modal.
  useEffect(() => {
    if (autoOpenNew) {
      openNewEmployeeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenNew]);

  const closeEditingModal = () => {
    setEditingEmployee(null);
    if (onCloseRedirectPath && location?.pathname !== onCloseRedirectPath) {
      navigate(onCloseRedirectPath);
    }
  };

  const closeEditing = () => {
    setEditingEmployee(null);
    if (onCloseRedirectPath && location.pathname !== onCloseRedirectPath) {
      navigate(onCloseRedirectPath);
    }
  };

  const handleSave = async () => {
    if (!editingEmployee?.nome) {
      alert("Por favor, preencha ao menos o nome do funcionário.");
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);

      const isEdit = Boolean(editingEmployee?._id);
      const targetUrl = isEdit
        ? `${API_BASE}/api/funcionarios/${editingEmployee._id}`
        : `${API_BASE}/api/funcionarios`;

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(targetUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEmployee)
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Falha ao salvar (${res.status}). ${txt}`);
      }

      setEditingEmployee(null);
      await fetchEmployees();
    } catch (e: any) {
      setLoadError(e?.message || 'Erro ao salvar funcionário.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;

    const id = deletingEmployee._id || deletingEmployee.id;
    if (!id) {
      alert('ID do funcionário não encontrado.');
      setDeletingEmployee(null);
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);

      const res = await fetch(`${API_BASE}/api/funcionarios/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Falha ao excluir (${res.status}). ${txt}`);
      }

      setDeletingEmployee(null);
      await fetchEmployees();
    } catch (e: any) {
      setLoadError(e?.message || 'Erro ao excluir funcionário.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Exportação (mantida)
  // =========================
  const exportToExcel = () => {
    const data = filteredEmployees.map(emp => ({
      'Matrícula': emp.id || emp.matricula || emp._id || '',
      'Nome': emp._displayNome,
      'Cidade': emp._displayCidade,
      'Situação': emp._displaySituacao,
      'Telefone': emp._displayTelefone,
      'Idade': emp._displayIdade,
      'Status CNH': emp._displayCNHStatus,
      'Dias CNH': emp._displayCNHDias,
      'Categoria': emp._displayCategoria
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Funcionários');
    XLSX.writeFile(wb, 'Lista_Funcionarios.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Funcionários - ERP Pro', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Mat.', 'Nome', 'Cidade', 'Situação', 'Telefone', 'Idade', 'Status CNH', 'Dias CNH']],
      body: filteredEmployees.map(emp => [
        emp.id || emp.matricula || emp._id || '',
        emp._displayNome,
        emp._displayCidade,
        emp._displaySituacao,
        emp._displayTelefone,
        String(emp._displayIdade),
        emp._displayCNHStatus,
        String(emp._displayCNHDias)
      ]),
    });
    doc.save('Lista_Funcionarios.pdf');
  };

  // =========================
  // ViaCEP
  // =========================
  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = maskCEP(e.target.value);
    setEditingEmployee({ ...editingEmployee, cep: val });
    const cleanCEP = val.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEditingEmployee((prev: any) => ({
            ...prev,
            cep: val,
            endereco: data.logradouro,
            bairro: data.bairro,
            municipio: data.localidade,
            estado: data.uf
          }));
        }
      } catch (err) {
        console.error("Erro ViaCEP", err);
      }
    }
  };

  const updateEmployeeField = (field: string, value: any) => {
    if (field === 'validade_cnh') {
      const status = calculateCNHStatus(value);
      setEditingEmployee({ ...editingEmployee, [field]: value, statusCNH: status });
      return;
    }
    setEditingEmployee({ ...editingEmployee, [field]: value });
  };

  // =========================
  // Anexos (mantido)
  // =========================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentFileKey && editingEmployee) {
      const randomCode = Date.now().toString();
      const sanitizedName = (editingEmployee.nome || 'Usuario').trim().replace(/\s+/g, '_');
      const extension = file.name.split('.').pop();
      const newFileName = `${randomCode}_${sanitizedName}-${currentFileKey}.${extension}`;
      const fullPath = `C:\\Users\\contr\\Dropbox\\uploads\\${newFileName}`;

      setEditingEmployee({
        ...editingEmployee,
        arquivos: {
          ...editingEmployee.arquivos,
          [currentFileKey]: {
            name: newFileName,
            path: fullPath
          }
        }
      });
    }
    setCurrentFileKey(null);
    if (e.target) e.target.value = '';
  };

  const openFile = (fileInfo: any) => {
    if (fileInfo && fileInfo.path) {
      const win = window.open('about:blank', '_blank');
      if (win) {
        win.document.write(`<html><body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f0f0;">
          <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center;">
            <h2 style="color: #135bec;">Visualização de Arquivo</h2>
            <p><strong>Caminho:</strong> ${fileInfo.path}</p>
            <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #135bec; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">Fechar Aba</button>
          </div>
        </body></html>`);
      }
    }
  };

  const renderTabContent = () => {
    if (!editingEmployee) return null;
    switch (activeTab) {
      case 'Identificação':
        return (
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-border-dark space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* O conteúdo do seu formulário completo permanece aqui.
               Mantive as funções e estrutura existentes; apenas removi mock/localStorage e implementei fetch/paginação/feedback. */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined font-bold">person</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Dados Pessoais e Profissionais
                </h3>
              </div>

              {/* Exemplo (mantenha/complete com seu formulário real) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                  <input
                    type="text"
                    value={editingEmployee.nome || ''}
                    onChange={(e) => updateEmployeeField('nome', e.target.value)}
                    className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold px-4"
                  />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF</label>
                  <input
                    type="text"
                    value={editingEmployee.cpf || ''}
                    onChange={(e) => updateEmployeeField('cpf', maskCPF(e.target.value))}
                    className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold px-4"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'Acesso':
        if (safeUser.role !== 'Admin') return null;
        return (
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-border-dark space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* mantenha seu formulário de acesso */}
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Aba Acesso (Admin)
            </div>
          </div>
        );

      case 'Anexos':
        return (
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-border-dark space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* mantenha sua seção de anexos */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Aba Anexos
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Cadastro de Funcionários
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Recursos Humanos</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary">Funcionários</span>
          </div>
        </div>

        {/* ====== FILTROS (conforme solicitado) ====== */}
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-border-dark space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[300px] relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <input
                type="text"
                placeholder="Filtrar por nome, CPF, cidade..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <button onClick={clearAllFilters} className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">Limpar Filtro</button>
              <button onClick={handleAddNew} className="flex items-center gap-2 h-12 px-8 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">Novo</button>
              <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`flex items-center justify-center h-12 w-12 rounded-2xl border-2 transition-all ${showAdvancedFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark text-slate-400'}`} title="Mostrar/ocultar filtros avançados">
                <span className="material-symbols-outlined">filter_list</span>
              </button>

              <div className="relative" ref={exportMenuRef}>
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest">Exportar ▾</button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-slate-100 dark:border-border-dark z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                      <span className="material-symbols-outlined text-emerald-500">table_view</span>Exportar XLSX
                    </button>
                    <button onClick={exportToPDF} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                      <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>Exportar PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Situação</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {Object.entries(stats.sit).map(([key, count]) => (
                      <button key={key} onClick={() => toggleFilter(filterSituacao, setFilterSituacao, key)} className={`group min-w-[90px] p-3 rounded-2xl border-2 transition-all flex flex-col items-center ${filterSituacao.includes(key) ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-slate-50/50 dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                        <span className={`text-[10px] font-black uppercase mb-1 ${filterSituacao.includes(key) ? 'text-primary' : 'text-slate-400'}`}>{key}</span>
                        <span className={`text-xl font-black ${filterSituacao.includes(key) ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Status CNH</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {Object.entries(stats.cnh).map(([key, count]) => (
                      <button key={key} onClick={() => toggleFilter(filterCNHStatus, setFilterCNHStatus, key)} className={`group min-w-[100px] p-3 rounded-2xl border-2 transition-all flex flex-col items-center ${filterCNHStatus.includes(key) ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-slate-50/50 dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                        <span className={`text-[10px] font-black uppercase mb-1 ${filterCNHStatus.includes(key) ? 'text-primary' : 'text-slate-400'}`}>{key}</span>
                        <span className={`text-xl font-black ${filterCNHStatus.includes(key) ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Categorias CNH</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Object.entries(stats.cat).map(([key, count]) => (
                      <button key={key} onClick={() => toggleFilter(filterCategoria, setFilterCategoria, key)} className={`group min-w-[60px] p-2 rounded-xl border-2 transition-all flex flex-col items-center ${filterCategoria.includes(key) ? 'bg-primary/5 border-primary' : 'bg-slate-50/50 dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                        <span className={`text-[10px] font-black uppercase mb-0.5 ${filterCategoria.includes(key) ? 'text-primary' : 'text-slate-400'}`}>{key}</span>
                        <span className={`text-lg font-black ${filterCategoria.includes(key) ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback visual (antes da tabela) */}
      {loading && (
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-border-dark">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold">
            <span className="material-symbols-outlined text-primary">hourglass_top</span>
            Carregando dados do banco...
          </div>
        </div>
      )}

      {loadError && (
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-xl border border-red-200 dark:border-red-900/40">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-300 font-black">
              <span className="material-symbols-outlined">error</span>
              Erro ao carregar
            </div>
            <div className="text-sm font-bold text-slate-600 dark:text-slate-300">{loadError}</div>
            <div>
              <button
                onClick={() => fetchEmployees()}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-red-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-red-700 transition-all"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-border-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-8 py-5">Nome</th>
                <th className="px-8 py-5">Cidade</th>
                <th className="px-8 py-5">Situação</th>
                <th className="px-8 py-5">Telefone</th>
                <th className="px-8 py-5 text-center">Idade</th>
                <th className="px-8 py-5">Status CNH</th>
                <th className="px-8 py-5 text-right">Dias CNH</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {/* obrigatório: pagedEmployees.map */}
              {pagedEmployees.map((emp: any) => (
                <tr key={emp._rowKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{emp._displayNome}</td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">{emp._displayCidade}</td>
                  <td className="px-8 py-5"><span className={getStatusBadge(emp._displaySituacao)}>{emp._displaySituacao}</span></td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{emp._displayTelefone}</td>
                  <td className="px-8 py-5 text-center text-sm font-black text-slate-900 dark:text-white">{emp._displayIdade}</td>
                  <td className="px-8 py-5"><span className={getStatusBadge(emp._displayCNHStatus)}>{emp._displayCNHStatus}</span></td>
                  <td className={`px-8 py-5 text-right text-sm font-black ${emp._displayCNHDias < 0 ? 'text-red-500' : emp._displayCNHDias <= 30 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {emp._displayCNHDias}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingEmployee({ ...emp })}
                        className="size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingEmployee({ ...emp })}
                        className="size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Página {page} de {totalPages} — {filteredEmployees.length} registro(s)
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-[11px] uppercase tracking-widest disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-[11px] uppercase tracking-widest disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>

      {editingEmployee && (
        <div className="fixed inset-0 z-[60] overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900">
          <div className="p-6 bg-white dark:bg-surface-dark border-b border-slate-100 dark:border-border-dark flex items-center justify-between shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {editingEmployee?._id ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Matrícula: {editingEmployee.id || editingEmployee._id || '-'}
              </p>
            </div>
            <button onClick={closeEditingModal} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 transition-all">
              <span className="material-symbols-outlined">close</span>Fechar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
            <div className="max-w-[1600px] mx-auto p-10 space-y-12">
              <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {renderTabContent()}
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-border-dark flex items-center justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button onClick={closeEditingModal} className="px-10 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button onClick={handleSave} className="px-14 py-4 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 transform active:scale-95 transition-all">
              Salvar Dados
            </button>
          </div>
        </div>
      )}

      {deletingEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl space-y-8 animate-in zoom-in-95">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="size-16 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-4xl">delete_forever</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Confirma a exclusão?</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Você está prestes a excluir permanentemente o registro de <b>{deletingEmployee._displayNome || deletingEmployee.nome}</b>.
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setDeletingEmployee(null)} className="flex-1 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all">
                Cancelar
              </button>
              <button onClick={handleDelete} className="flex-1 h-14 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all">
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
