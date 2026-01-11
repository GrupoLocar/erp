
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import EmployeeList from './pages/EmployeeList';
import Schedule from './pages/Schedule';
import CompletedSchedule from './pages/CompletedSchedule';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { User, Role } from './types';

// Mock Module for new pages
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-10">
    <h1 className="text-3xl font-black text-slate-900 dark:text-white">{title}</h1>
    <p className="mt-4 text-slate-500">Esta é a página de {title}. Conteúdo em desenvolvimento.</p>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Helper to check if user has access to a specific role-based path
  const hasAccess = (requiredRole: Role) => {
    if (!user) return false;
    return user.role === "Admin" || user.role === requiredRole;
  };

  return (
    <HashRouter>
      <div className="flex flex-col h-screen overflow-hidden text-slate-900 dark:text-slate-100 font-display">
        {user ? (
          <>
            <Header user={user} onLogout={handleLogout} />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar user={user} onLogout={handleLogout} />
              <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                <Routes>
                  <Route path="/" element={<Home user={user} />} />
                  
                  {/* Protected Routes - RH */}
                  <Route
                    path="/rh/employees"
                    element={hasAccess("Recursos Humanos") ? <EmployeeList user={user} /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/rh/employees/new"
                    element={hasAccess("Recursos Humanos") ? <EmployeeList user={user} autoOpenNew onCloseRedirectPath="/rh/employees" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/rh/dashboard"
                    element={hasAccess("Recursos Humanos") ? <PlaceholderPage title="Dashboard" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/rh/candidates"
                    element={hasAccess("Recursos Humanos") ? <PlaceholderPage title="Gestão de Candidatos" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/rh/training"
                    element={hasAccess("Recursos Humanos") ? <PlaceholderPage title="Entrevista" /> : <Navigate to="/" />}
                  />

                  {/* Protected Routes - DP */}
                  <Route
                    path="/dp/loc-init"
                    element={hasAccess("Departamento Pessoal") ? <PlaceholderPage title="Monitorar inicialização dos LOC's" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/dp/ca-hours"
                    element={hasAccess("Departamento Pessoal") ? <PlaceholderPage title="Imput de horários no CA" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/dp/travel-food"
                    element={hasAccess("Departamento Pessoal") ? <PlaceholderPage title="Controle de viagem para alimentação" /> : <Navigate to="/" />}
                  />

                  {/* Protected Routes - Comercial */}
                  <Route
                    path="/comercial/schedule"
                    element={hasAccess("Comercial") ? <Schedule /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/comercial/completed-schedule"
                    element={hasAccess("Comercial") ? <CompletedSchedule /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/comercial/clients"
                    element={hasAccess("Comercial") ? <PlaceholderPage title="Cadastro de Clientes" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/comercial/branches"
                    element={hasAccess("Comercial") ? <PlaceholderPage title="Cadastro de Filial" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/comercial/suppliers"
                    element={hasAccess("Comercial") ? <PlaceholderPage title="Cadastro de Fornecedores" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/comercial/psl"
                    element={hasAccess("Comercial") ? <PlaceholderPage title="PSL (Pedidos sem Loc)" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/comercial/fines"
                    element={hasAccess("Comercial") ? <PlaceholderPage title="Multas e Avarias" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/comercial/goals"
                    element={hasAccess("Comercial") ? <PlaceholderPage title="Metas" /> : <Navigate to="/" />}
                  />

                  {/* Protected Routes - Financeiro */}
                  <Route
                    path="/financeiro/cash-flow"
                    element={hasAccess("Financeiro") ? <PlaceholderPage title="Fluxo de caixa" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/financeiro/accounts-payable"
                    element={hasAccess("Financeiro") ? <PlaceholderPage title="Contas a Pagar" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/financeiro/accounts-receivable"
                    element={hasAccess("Financeiro") ? <PlaceholderPage title="Contas a Receber" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/financeiro/diaries"
                    element={hasAccess("Financeiro") ? <PlaceholderPage title="Controle de diárias" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/financeiro/invoice-issue"
                    element={hasAccess("Financeiro") ? <PlaceholderPage title="Emissão de Nota" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/financeiro/measurement"
                    element={hasAccess("Financeiro") ? <PlaceholderPage title="Medição" /> : <Navigate to="/" />}
                  />

                  {/* Protected Routes - Controladoria */}
                  <Route
                    path="/controladoria/invoicing"
                    element={hasAccess("Controladoria") ? <PlaceholderPage title="Emissão de Faturas" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/controladoria/expenses"
                    element={hasAccess("Controladoria") ? <PlaceholderPage title="Controle de Despesas" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/controladoria/improper-charges"
                    element={hasAccess("Controladoria") ? <PlaceholderPage title="Controle de Indevidos" /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/controladoria/tax-invoice"
                    element={hasAccess("Controladoria") ? <PlaceholderPage title="Emissão de Nota Fiscal" /> : <Navigate to="/" />}
                  />
                  <Route 
                    path="/configuracoes" 
                    element={user.role === "Admin" ? <PlaceholderPage title="Configurações" /> : <Navigate to="/" />} 
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
