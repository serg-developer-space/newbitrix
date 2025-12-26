
import React from 'react';
import { Task, User, TaskStatus, UserRole } from '../types';
import RoleBadge from './RoleBadge';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  users: User[];
  currentUser: User;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onUpdateStatus, users, currentUser }) => {
  if (!task) return null;

  const isAdminOrManager = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;
  const assignee = users.find(u => u.id === task.assignedTo);
  const creator = users.find(u => u.id === task.createdBy);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (ts?: number) => ts ? new Date(ts).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '—';

  const calculatePerformerReward = () => {
    const rate = currentUser.role === UserRole.SENIOR_PERFORMER ? task.seniorPerformerRate : task.performerRate;
    return (task.cost * rate) / 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-slate-50 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[90vh]">
        <div className="bg-white px-8 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              task.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {task.priority} приоритет
            </div>
            <h2 className="text-xl font-black text-slate-900 truncate max-w-md">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-slate-200/30 p-8 flex justify-center custom-scrollbar">
            <div className="w-full max-w-[850px] bg-white shadow-xl rounded-sm p-16 min-h-screen">
              <div 
                className="prose prose-slate max-w-none text-slate-800"
                dangerouslySetInnerHTML={{ __html: task.description || '<p class="text-slate-400 italic">Описание не предоставлено.</p>' }}
              />
            </div>
          </div>

          <div className="w-80 bg-white border-l border-slate-200 p-6 space-y-8 overflow-y-auto custom-scrollbar">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Таймлайн</h4>
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Создана:</span>
                  <span className="text-slate-700 font-black">{formatDate(task.createdAt)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Начата:</span>
                  <span className="text-indigo-600 font-black">{formatDate(task.startedAt)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Завершена:</span>
                  <span className="text-emerald-600 font-black">{formatDate(task.completedAt)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Финансы</h4>
              <div className="bg-slate-900 rounded-xl p-4 text-white shadow-xl">
                {isAdminOrManager ? (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Общий бюджет</p>
                    <p className="text-lg font-black">{formatCurrency(task.cost)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Ваша выплата</p>
                    <p className="text-lg font-black text-emerald-100">{formatCurrency(calculatePerformerReward())}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Действия</h4>
              <div className="space-y-3">
                {task.status === TaskStatus.TODO && task.assignedTo === currentUser.id && (
                  <button 
                    onClick={() => onUpdateStatus(task.id, TaskStatus.IN_PROGRESS)}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Приступить к работе
                  </button>
                )}
                {task.status === TaskStatus.IN_PROGRESS && task.assignedTo === currentUser.id && (
                  <button 
                    onClick={() => onUpdateStatus(task.id, TaskStatus.DONE)}
                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg"
                  >
                    Завершить задачу
                  </button>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Исполнитель</h4>
              <div className="flex items-center space-x-3">
                <img src={assignee?.avatar} className="w-10 h-10 rounded-full border border-slate-100" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{assignee?.name}</p>
                  <RoleBadge role={assignee?.role || UserRole.PERFORMER} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
