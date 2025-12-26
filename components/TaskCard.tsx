
import React from 'react';
import { Task, TaskStatus, User, Project, UserRole } from '../types';

interface TaskCardProps {
  task: Task;
  user: User;
  assignee?: User;
  project?: Project;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, user, assignee, project, onUpdateStatus, onDelete, onClick }) => {
  const isAdminOrManager = user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
  const isAssignedToCurrent = task.assignedTo === user.id;

  const priorityMap: Record<string, string> = {
    Low: 'Низкий',
    Medium: 'Средний',
    High: 'Высокий',
  };

  const priorityColors = {
    Low: 'bg-slate-100 text-slate-500',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-rose-100 text-rose-700',
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  const calculateReward = () => {
    const rate = user.role === UserRole.SENIOR_PERFORMER ? task.seniorPerformerRate : task.performerRate;
    return (task.cost * rate) / 100;
  };

  const descriptionSnippet = task.description.replace(/<[^>]*>?/gm, '').substring(0, 80);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Добавляем эффект прозрачности после начала перетаскивания
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => target.classList.add('opacity-40'), 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('opacity-40');
  };

  return (
    <div 
      onClick={() => onClick(task)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all group cursor-grab active:cursor-grabbing relative"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
            {priorityMap[task.priority]}
          </span>
          {project && (
            <span 
              className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full border opacity-70"
              style={{ borderColor: project.color, color: project.color }}
            >
              {project.name}
            </span>
          )}
        </div>
        {isAdminOrManager && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }}
            className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
      </div>

      <h3 className="font-black text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{task.title}</h3>
      
      {/* Financial Info */}
      <div className="mb-3">
        {isAdminOrManager ? (
          <p className="text-[11px] font-black text-slate-900 bg-slate-50 inline-block px-2 py-1 rounded">
            Бюджет: {formatCurrency(task.cost)}
          </p>
        ) : (
          <div className="bg-emerald-50 inline-block px-2 py-1 rounded">
            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter leading-none">Ваше вознаграждение</p>
            <p className="text-[11px] font-black text-emerald-700">{formatCurrency(calculateReward())}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 font-medium line-clamp-2 h-8 leading-relaxed mb-4">{descriptionSnippet || 'Описание не указано.'}</p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <img src={assignee?.avatar} alt={assignee?.name} className="w-8 h-8 rounded-full border-2 border-slate-50 ring-1 ring-slate-100" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${task.status === TaskStatus.IN_PROGRESS ? 'bg-indigo-500' : task.status === TaskStatus.DONE ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-800 leading-none">{assignee?.name.split(' ')[0]}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{task.attachments?.length || 0} Файлов</p>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {task.status === TaskStatus.TODO && isAssignedToCurrent && (
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, TaskStatus.IN_PROGRESS); }}
              className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              НАЧАТЬ
            </button>
          )}
          {task.status === TaskStatus.IN_PROGRESS && isAssignedToCurrent && (
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, TaskStatus.DONE); }}
              className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
            >
              ГОТОВО
            </button>
          )}
          {task.status === TaskStatus.DONE && (
            <div className="bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center">
              <svg className="w-3 h-3 text-emerald-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-tighter">ВЫПОЛНЕНО</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
