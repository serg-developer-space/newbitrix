
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, Task, TaskStatus, Project, Lead, LeadStatus } from './types';
import RoleBadge from './components/RoleBadge';
import TaskCard from './components/TaskCard';
import LeadCard from './components/LeadCard';
import TaskModal from './components/TaskModal';
import LeadModal from './components/LeadModal';
import UserModal from './components/UserModal';
import ProjectModal from './components/ProjectModal';
import TaskDetailModal from './components/TaskDetailModal';
import Login from './components/Login';
import { apiService } from './services/apiService';
import { checkSupabaseConfig } from './lib/supabase';

type ViewType = 'TASKS' | 'LEADS' | 'USERS' | 'PAYMENTS';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [activeView, setActiveView] = useState<ViewType>('TASKS');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedUserForPayments, setSelectedUserForPayments] = useState<string | 'ALL'>('ALL');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    if (!checkSupabaseConfig()) {
      setConfigError(true);
      setIsLoading(false);
      return;
    }

    const initApp = async () => {
      try {
        const authData = localStorage.getItem('zentask_v3_auth');
        if (authData) setCurrentUser(JSON.parse(authData));

        const data = await apiService.fetchAllData();
        setUsers(data.users);
        setTasks(data.tasks);
        setLeads(data.leads);
        setProjects(data.projects);
      } catch (error) {
        console.error("Server connection failed", error);
        // В случае ошибки сервера можно оставить пустые массивы или показать уведомление
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const user = await apiService.login(email, pass);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('zentask_v3_auth', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('zentask_v3_auth');
    setActiveView('TASKS');
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isManager = currentUser?.role === UserRole.MANAGER;
  const isAdminOrManager = isAdmin || isManager;
  const isAnyPerformer = currentUser?.role === UserRole.PERFORMER || currentUser?.role === UserRole.SENIOR_PERFORMER;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    setIsSyncing(true);
    const updates = { 
      status: newStatus, 
      startedAt: newStatus === TaskStatus.IN_PROGRESS ? Date.now() : undefined,
      completedAt: newStatus === TaskStatus.DONE ? Date.now() : undefined
    };
    try {
      await apiService.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } catch (e) {
      alert('Ошибка синхронизации с сервером');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateTask = async (data: any) => {
    setIsSyncing(true);
    const newTask: Task = { 
      ...data, 
      id: `t-${Date.now()}`, 
      createdBy: currentUser!.id, 
      status: TaskStatus.TODO, 
      createdAt: Date.now() 
    };
    try {
      await apiService.saveTask(newTask);
      setTasks(prev => [...prev, newTask]);
    } catch (e) {
      alert('Не удалось сохранить задачу на сервере');
    } finally {
      setIsSyncing(false);
      setIsTaskModalOpen(false);
    }
  };

  const handleCreateProject = async (data: any) => {
    setIsSyncing(true);
    const newProject: Project = { ...data, id: `p-${Date.now()}`, createdAt: Date.now() };
    try {
      await apiService.createProject(newProject);
      setProjects(prev => [...prev, newProject]);
    } catch (e) {
      alert('Ошибка при создании проекта');
    } finally {
      setIsSyncing(false);
      setIsProjectModalOpen(false);
    }
  };

  const handleCreateUser = async (data: any) => {
    setIsSyncing(true);
    const newUser: User = { ...data, id: `u-${Date.now()}`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}` };
    try {
      await apiService.createUser(newUser);
      setUsers(prev => [...prev, newUser]);
    } catch (e) {
      alert('Ошибка при добавлении пользователя');
    } finally {
      setIsSyncing(false);
      setIsUserModalOpen(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Удалить эту задачу навсегда?')) {
      setIsSyncing(true);
      try {
        await apiService.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      setIsSyncing(true);
      try {
        await apiService.deleteUser(userToDelete.id);
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      } finally {
        setUserToDelete(null);
        setIsSyncing(false);
      }
    }
  };

  const paymentsStats = useMemo(() => {
    const targetUserId = isAnyPerformer ? currentUser?.id : selectedUserForPayments;
    const isShowingAll = !isAnyPerformer && targetUserId === 'ALL';
    const targetUser = !isShowingAll ? users.find(u => u.id === targetUserId) : null;

    const relevantTasks = tasks.filter(t => {
      if (isShowingAll) return true;
      if (targetUser) return t.assignedTo === targetUser.id || t.createdBy === targetUser.id;
      return false;
    });

    let earned = 0;
    let pending = 0;

    relevantTasks.forEach(t => {
      let reward = 0;
      if (isShowingAll) {
        reward = (t.cost * (t.managerRate + t.performerRate + t.seniorPerformerRate) / 100);
      } else if (targetUser) {
        if (t.assignedTo === targetUser.id) {
          const rate = targetUser.role === UserRole.SENIOR_PERFORMER ? t.seniorPerformerRate : t.performerRate;
          reward += (t.cost * rate) / 100;
        }
        if (t.createdBy === targetUser.id && targetUser.role === UserRole.MANAGER) {
          reward += (t.cost * t.managerRate) / 100;
        }
      }
      
      if (t.status === TaskStatus.DONE) earned += reward;
      else pending += reward;
    });

    return { earned, pending, count: relevantTasks.length, tasks: relevantTasks };
  }, [tasks, selectedUserForPayments, currentUser, users, isAnyPerformer]);

  if (configError) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center mb-8 border border-rose-500/30">
          <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Сервер не настроен</h2>
        <p className="text-slate-400 max-w-md mb-8 leading-relaxed font-medium">Для работы приложения необходимо указать <code className="text-indigo-400">SUPABASE_URL</code> и <code className="text-indigo-400">SUPABASE_ANON_KEY</code> в файле <code className="text-slate-200">lib/supabase.ts</code>.</p>
        <a href="https://supabase.com" target="_blank" rel="noreferrer" className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase text-xs tracking-widest">Открыть Supabase</a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-white font-black uppercase tracking-[0.3em] text-sm animate-pulse">ZenFlow Connecting...</h2>
      </div>
    );
  }

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-slate-50 font-inter overflow-hidden relative">
      {isSyncing && (
        <div className="absolute top-6 right-6 z-[100] bg-white px-4 py-2 rounded-full shadow-2xl border border-indigo-100 flex items-center space-x-2 animate-bounce">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cloud Sync...</span>
        </div>
      )}

      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl text-white font-black">Z</div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">ZenFlow</h1>
          </div>
          <nav className="space-y-1">
            {[
              { id: 'TASKS', label: 'Задачи', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { id: 'PAYMENTS', label: 'Финансы', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
              ...(isAdminOrManager ? [
                { id: 'LEADS', label: 'CRM Лиды', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857' },
                { id: 'USERS', label: 'Команда', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1' }
              ] : [])
            ].map(item => (
              <button 
                key={item.id} onClick={() => setActiveView(item.id as ViewType)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeView === item.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeView === 'TASKS' && (
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Проекты</h3>
              <div className="space-y-1">
                <button onClick={() => setActiveProjectId(null)} className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-bold ${!activeProjectId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>Весь бэклог</button>
                {projects.map(p => (
                  <button key={p.id} onClick={() => setActiveProjectId(p.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold ${activeProjectId === p.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 truncate">{currentUser.name}</p>
              <RoleBadge role={currentUser.role} />
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all">Выход</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeView === 'TASKS' ? (projects.find(p => p.id === activeProjectId)?.name || 'Бэклог') : activeView === 'PAYMENTS' ? 'Финансовый отчет' : activeView === 'LEADS' ? 'CRM Лиды' : 'Команда'}
            </h2>
            <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Realtime Cloud</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {activeView === 'TASKS' && isAdminOrManager && (
              <>
                <button onClick={() => setIsProjectModalOpen(true)} className="px-4 py-3 border border-slate-200 text-slate-600 text-[11px] font-black rounded-xl hover:bg-slate-50 uppercase tracking-widest transition-colors">Проект+</button>
                <button onClick={() => setIsTaskModalOpen(true)} className="px-8 py-3 bg-slate-900 text-white text-[11px] font-black rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-200 uppercase tracking-widest transition-all active:scale-95">Создать задачу</button>
              </>
            )}
            {activeView === 'USERS' && isAdmin && (
              <button onClick={() => setIsUserModalOpen(true)} className="px-8 py-3 bg-slate-900 text-white text-[11px] font-black rounded-xl hover:bg-slate-800 shadow-xl uppercase tracking-widest">Добавить сотрудника</button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeView === 'PAYMENTS' ? (
            <div className="space-y-8 max-w-6xl mx-auto">
              {isAdmin && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h3 className="text-sm font-black text-slate-900">Фильтр по сотруднику</h3>
                  </div>
                  <select value={selectedUserForPayments} onChange={(e) => setSelectedUserForPayments(e.target.value)} className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none min-w-[300px]">
                    <option value="ALL">Вся организация (Общий фонд)</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Выплачено</p>
                  <p className="text-4xl font-black text-emerald-600 leading-none">{formatCurrency(paymentsStats.earned)}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">В работе (ожидает)</p>
                  <p className="text-4xl font-black text-amber-500 leading-none">{formatCurrency(paymentsStats.pending)}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Всего задач</p>
                  <p className="text-4xl font-black text-slate-900 leading-none">{paymentsStats.count}</p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Задача</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Статус</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Начисление</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentsStats.tasks.map(t => {
                      const userToCalc = !isAnyPerformer && selectedUserForPayments !== 'ALL' ? users.find(u => u.id === selectedUserForPayments) : currentUser;
                      let reward = 0;
                      if (selectedUserForPayments === 'ALL' && isAdmin) {
                        reward = (t.cost * (t.managerRate + t.performerRate + t.seniorPerformerRate) / 100);
                      } else if (userToCalc) {
                        if (t.assignedTo === userToCalc.id) {
                          const rate = userToCalc.role === UserRole.SENIOR_PERFORMER ? t.seniorPerformerRate : t.performerRate;
                          reward += (t.cost * rate) / 100;
                        }
                        if (t.createdBy === userToCalc.id && userToCalc.role === UserRole.MANAGER) {
                          reward += (t.cost * t.managerRate) / 100;
                        }
                      }
                      
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-5">
                            <p className="font-bold text-slate-800">{t.title}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">ID: {t.id}</p>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${t.status === TaskStatus.DONE ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {t.status === TaskStatus.DONE ? 'Выплачено' : 'В работе'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">{formatCurrency(reward)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeView === 'USERS' ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Сотрудник</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Роль</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 group">
                      <td className="px-8 py-5 flex items-center space-x-3">
                        <img src={u.avatar} className="w-10 h-10 rounded-full bg-slate-100 shadow-sm" />
                        <div>
                          <span className="font-bold text-slate-800 block">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5"><RoleBadge role={u.role} /></td>
                      <td className="px-8 py-5 text-right">
                        {isAdmin && u.id !== currentUser.id && (
                          <button onClick={() => setUserToDelete(u)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
              {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map(status => (
                <div key={status} className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">{status === TaskStatus.TODO ? 'К выполнению' : status === TaskStatus.IN_PROGRESS ? 'В процессе' : 'Завершено'}</h3>
                    <span className="text-[10px] font-black text-slate-300">{tasks.filter(t => t.status === status && (!activeProjectId || t.projectId === activeProjectId) && (!isAnyPerformer || t.assignedTo === currentUser.id)).length}</span>
                  </div>
                  <div className="space-y-4 min-h-[400px]">
                    {tasks.filter(t => t.status === status && (!activeProjectId || t.projectId === activeProjectId) && (!isAnyPerformer || t.assignedTo === currentUser.id)).map(t => (
                      <TaskCard key={t.id} task={t} user={currentUser} assignee={users.find(u => u.id === t.assignedTo)} project={projects.find(p => p.id === t.projectId)} onUpdateStatus={handleUpdateStatus} onClick={setSelectedTask} onDelete={handleDeleteTask} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-4">Удалить сотрудника?</h3>
            <p className="text-slate-500 text-sm mb-8">{userToDelete.name} будет исключен из корпоративной базы данных.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setUserToDelete(null)} className="py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Отмена</button>
              <button onClick={confirmDeleteUser} className="py-4 bg-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors">Удалить</button>
            </div>
          </div>
        </div>
      )}

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSubmit={handleCreateTask} users={users} projects={projects} defaultProjectId={activeProjectId || undefined} />
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdateStatus={handleUpdateStatus} users={users} currentUser={currentUser} />
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSubmit={handleCreateProject} />
      <LeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} onSubmit={() => {}} />
      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSubmit={handleCreateUser} />
    </div>
  );
};

export default App;
