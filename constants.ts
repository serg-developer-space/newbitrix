import { User, UserRole, TaskStatus, Task, Project, Lead, LeadStatus } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Александр Админ',
    email: 'admin@zentask.com',
    role: UserRole.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    password: 'password123'
  },
  {
    id: 'u2',
    name: 'Сара Менеджер',
    email: 'sarah.m@zentask.com',
    role: UserRole.MANAGER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    password: 'password123'
  },
  {
    id: 'u3',
    name: 'Иван Исполнитель',
    email: 'ivan.p@zentask.com',
    role: UserRole.PERFORMER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ivan',
    password: 'password123'
  },
  {
    id: 'u4',
    name: 'Елена Разработчик',
    email: 'elena.w@zentask.com',
    role: UserRole.PERFORMER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
    password: 'password123'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Ребрендинг мобильного приложения',
    color: '#6366f1',
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'p2',
    name: 'Внутренняя панель управления',
    color: '#10b981',
    createdAt: Date.now() - 5000000,
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Обновление дизайн-системы',
    description: 'Обновить основные компоненты дизайн-системы для редизайна мобильного приложения.',
    status: TaskStatus.TODO,
    assignedTo: 'u3',
    createdBy: 'u2',
    createdAt: Date.now() - 86400000,
    priority: 'High',
    // Added required financial properties to satisfy Task interface
    cost: 10000,
    managerRate: 10,
    performerRate: 15,
    seniorPerformerRate: 0
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Разработка корпоративного сайта',
    contact: 'Игорь (+7 900 123-45-67)',
    description: 'Нужен современный лендинг для консалтингового агентства.',
    cost: 150000,
    status: LeadStatus.NEW,
    createdAt: Date.now() - 43200000
  },
  {
    id: 'l2',
    name: 'Интеграция платежной системы',
    contact: 'ООО "ФинТех" (hr@fintech.ru)',
    description: 'Добавить поддержку крипто-платежей в существующий сервис.',
    cost: 85000,
    status: LeadStatus.QUALIFIED,
    createdAt: Date.now() - 172800000
  }
];
