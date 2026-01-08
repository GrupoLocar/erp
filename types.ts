
export enum EmployeeStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
  BLOCKED = 'Bloqueado',
  VACATION = 'Férias',
  PJ = 'PJ'
}

export enum CNHStatus {
  EXPIRED = 'Vencido',
  EXPIRING = 'A Vencer',
  VALID = 'Prazo'
}

export interface Employee {
  id: string;
  name: string;
  city: string;
  status: EmployeeStatus;
  phone: string;
  age: number;
  birthDate: string;
  cpf: string;
  rg: string;
  cnhNumber: string;
  cnhCategories: string[];
  cnhExpiry: string;
  cnhStatus: CNHStatus;
  cnhDaysRemaining: number;
  address: {
    cep: string;
    street: string;
    number: string;
  };
}

export interface ScheduleRecord {
  id: string;
  loc: string;
  date: string;
  startTime: string;
  branch: string;
  operator: string;
  status: 'ok' | 'warning' | 'error';
}

export type Role = "Admin" | "Recursos Humanos" | "Departamento Pessoal" | "Controladoria" | "Financeiro" | "Comercial";

export interface User {
  name: string;
  registration: string;
  avatar: string;
  role: Role;
}
