
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, Attachment, Project } from '../types';
import { generateTaskDescription } from '../services/geminiService';
import RichTextEditor from './RichTextEditor';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { 
    title: string; 
    description: string; 
    priority: 'Low' | 'Medium' | 'High'; 
    assignedTo: string;
    projectId: string;
    attachments: Attachment[];
    cost: number;
    managerRate: number;
    performerRate: number;
    seniorPerformerRate: number;
  }) => void;
  users: User[];
  projects: Project[];
  defaultProjectId?: string;
}

type RatePreset = 'PRESET_1' | 'PRESET_2' | 'MANUAL';

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, users, projects, defaultProjectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [projectId, setProjectId] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Financial states
  const [cost, setCost] = useState<string>('0');
  const [preset, setPreset] = useState<RatePreset>('PRESET_1');
  const [managerRate, setManagerRate] = useState<number>(10);
  const [performerRate, setPerformerRate] = useState<number>(15);
  const [seniorRate, setSeniorRate] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setProjectId(defaultProjectId || projects[0]?.id || '');
      const firstPerformer = users.find(u => u.role === UserRole.PERFORMER || u.role === UserRole.SENIOR_PERFORMER);
      setAssignedTo(firstPerformer?.id || '');
    }
  }, [isOpen, defaultProjectId, projects, users]);

  useEffect(() => {
    if (preset === 'PRESET_1') {
      setManagerRate(10);
      setPerformerRate(15);
      setSeniorRate(0);
    } else if (preset === 'PRESET_2') {
      setManagerRate(8);
      setPerformerRate(15);
      setSeniorRate(6);
    }
  }, [preset]);

  if (!isOpen) return null;

  const handleAiDescription = async () => {
    if (!title) return;
    setIsGenerating(true);
    const result = await generateTaskDescription(title);
    setDescription(result);
    setIsGenerating(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: Attachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    onSubmit({ 
      title, description, priority, assignedTo, projectId, attachments,
      cost: Number(cost),
      managerRate,
      performerRate,
      seniorPerformerRate: seniorRate
    });
    setTitle('');
    setDescription('');
    setAttachments([]);
    setCost('0');
    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 max-h-[95vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900">Новая задача</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Заголовок задачи</label>
                <input 
                  type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Напр. Интеграция API..."
                  className="w-full px-4 py-3 text-lg font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Общая стоимость (₽)</label>
                <input 
                  type="number" required value={cost} onChange={e => setCost(e.target.value)}
                  className="w-full px-4 py-3 text-lg font-black rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-indigo-600"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Распределение вознаграждений</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  type="button" onClick={() => setPreset('PRESET_1')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${preset === 'PRESET_1' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}
                >
                  М: 10% / И: 15%
                </button>
                <button 
                  type="button" onClick={() => setPreset('PRESET_2')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${preset === 'PRESET_2' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}
                >
                  М: 8% / И: 15% / С: 6%
                </button>
                <button 
                  type="button" onClick={() => setPreset('MANUAL')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${preset === 'MANUAL' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}
                >
                  Ввод вручную
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Менеджер (%)</label>
                  <input 
                    type="number" disabled={preset !== 'MANUAL'} value={managerRate} onChange={e => setManagerRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold disabled:bg-slate-100"
                  />
                  <p className="text-[10px] font-bold text-slate-400">Выплата: {formatCurrency(Number(cost) * managerRate / 100)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Исполнитель (%)</label>
                  <input 
                    type="number" disabled={preset !== 'MANUAL'} value={performerRate} onChange={e => setPerformerRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold disabled:bg-slate-100"
                  />
                  <p className="text-[10px] font-bold text-slate-400">Выплата: {formatCurrency(Number(cost) * performerRate / 100)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Старший исп. (%)</label>
                  <input 
                    type="number" disabled={preset !== 'MANUAL'} value={seniorRate} onChange={e => setSeniorRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold disabled:bg-slate-100"
                  />
                  <p className="text-[10px] font-bold text-slate-400">Выплата: {formatCurrency(Number(cost) * seniorRate / 100)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Проект</label>
                <select 
                  value={projectId} onChange={e => setProjectId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 bg-white"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Исполнитель</label>
                <select 
                  value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 bg-white"
                >
                  {users.filter(u => u.role === UserRole.PERFORMER || u.role === UserRole.SENIOR_PERFORMER).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Описание</label>
                <button 
                  type="button" onClick={handleAiDescription}
                  disabled={isGenerating || !title}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all"
                >
                  <svg className={`w-3 h-3 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {isGenerating ? 'ГЕНЕРАЦИЯ...' : 'AI ЧЕРНОВИК'}
                </button>
              </div>
              <RichTextEditor value={description} onChange={setDescription} placeholder="Технические требования или шаги выполнения..." />
            </div>
          </form>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex space-x-4">
          <button type="button" onClick={onClose} className="px-8 py-4 text-slate-500 font-black rounded-xl hover:text-slate-700 transition-colors">ОТМЕНА</button>
          <button type="submit" form="task-form" className="flex-1 px-4 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 shadow-xl transition-all">СОЗДАТЬ ЗАДАЧУ</button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
