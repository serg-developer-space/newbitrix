
import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<User, 'id' | 'avatar'>) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PERFORMER);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    onSubmit({ name, email, password, role });
    setName('');
    setEmail('');
    setPassword('');
    setRole(UserRole.PERFORMER);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900">Новый сотрудник</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">ФИО сотрудника</label>
            <input 
              required type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Иван Иванов"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Логин (Email)</label>
            <input 
              required type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ivan@company.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Пароль</label>
            <input 
              required type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Системная роль</label>
            <select 
              value={role} onChange={e => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold outline-none bg-white"
            >
              <option value={UserRole.ADMIN}>Главный администратор</option>
              <option value={UserRole.MANAGER}>Менеджер</option>
              <option value={UserRole.SENIOR_PERFORMER}>Старший исполнитель</option>
              <option value={UserRole.PERFORMER}>Исполнитель</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-4 text-slate-500 font-black rounded-xl hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest">Отмена</button>
            <button type="submit" className="flex-1 px-4 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 shadow-xl uppercase text-[10px] tracking-widest">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
