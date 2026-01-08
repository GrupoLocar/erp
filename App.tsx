
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import EmployeeList from './pages/EmployeeList';
import Schedule from './pages/Schedule';
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
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/rh/*" 
                    element={hasAccess("Recursos Humanos") ? <EmployeeList /> : <Navigate to="/" />} 
                  />
                  <Route 
                    path="/dp/*" 
                    element={hasAccess("Departamento Pessoal") ? <PlaceholderPage title="Departamento Pessoal" /> : <Navigate to="/" />} 
                  />
                  <Route 
                    path="/comercial/*" 
                    element={hasAccess("Comercial") ? <Schedule /> : <Navigate to="/" />} 
                  />
                  <Route 
                    path="/financeiro/*" 
                    element={hasAccess("Financeiro") ? <PlaceholderPage title="Financeiro" /> : <Navigate to="/" />} 
                  />
                  <Route 
                    path="/controladoria/*" 
                    element={hasAccess("Controladoria") ? <PlaceholderPage title="Controladoria" /> : <Navigate to="/" />} 
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
