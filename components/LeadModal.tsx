
import React, { useState } from 'react';
import { LeadStatus } from '../types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: { 
    name: string; 
    contact: string; 
    cost: number; 
    description: string;
    status: LeadStatus;
  }) => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    onSubmit({ 
      name, 
      contact, 
      cost: Number(cost), 
      description,
      status: LeadStatus.NEW 
    });
    setName('');
    setContact('');
    setCost('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900">Новый лид</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Название сделки</label>
            <input 
              required type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Напр. Разработка CRM"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Контакт</label>
              <input 
                required type="text" value={contact} onChange={e => setContact(e.target.value)}
                placeholder="Имя, телефон или email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Стоимость (₽)</label>
              <input 
                required type="number" value={cost} onChange={e => setCost(e.target.value)}
                placeholder="50000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Комментарий</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Детали запроса..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-medium outline-none h-24 resize-none text-sm"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-4 text-slate-500 font-black rounded-xl hover:bg-slate-50 transition-colors">ОТМЕНА</button>
            <button type="submit" className="flex-1 px-4 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100">СОЗДАТЬ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
