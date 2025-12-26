
import React from 'react';
import { Lead, LeadStatus } from '../types';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onMove: (leadId: string, newStatus: LeadStatus) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, onMove }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('leadId', lead.id);
    e.dataTransfer.effectAllowed = 'move';
    // Добавляем класс прозрачности для визуального эффекта перетаскивания
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => target.classList.add('opacity-40'), 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('opacity-40');
  };

  return (
    <div 
      onClick={() => onClick(lead)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all group cursor-grab active:cursor-grabbing relative"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">
          ID: {lead.id.split('-')[1] || lead.id}
        </span>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Стоимость</p>
          <p className="text-sm font-black text-slate-900">{formatCurrency(lead.cost)}</p>
        </div>
      </div>

      <h3 className="font-black text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{lead.name}</h3>
      <div className="flex items-center text-[11px] text-slate-500 font-medium mb-3">
        <svg className="w-3.5 h-3.5 mr-1 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
        {lead.contact}
      </div>

      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[9px] text-slate-400 font-bold uppercase">
          {new Date(lead.createdAt).toLocaleDateString()}
        </span>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {lead.status !== LeadStatus.WON && lead.status !== LeadStatus.LOST && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const statuses = Object.values(LeadStatus);
                const currentIndex = statuses.indexOf(lead.status);
                if (currentIndex < statuses.length - 1) onMove(lead.id, statuses[currentIndex + 1] as LeadStatus);
              }}
              className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              title="Следующий этап"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
