
import React from 'react';
import { UserRole } from '../types';

interface RoleBadgeProps {
  role: UserRole;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const styles = {
    [UserRole.ADMIN]: 'bg-purple-100 text-purple-700 border-purple-200',
    [UserRole.MANAGER]: 'bg-blue-100 text-blue-700 border-blue-200',
    [UserRole.SENIOR_PERFORMER]: 'bg-teal-100 text-teal-700 border-teal-200',
    [UserRole.PERFORMER]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const labels = {
    [UserRole.ADMIN]: 'Администратор',
    [UserRole.MANAGER]: 'Менеджер',
    [UserRole.SENIOR_PERFORMER]: 'Старший исполнитель',
    [UserRole.PERFORMER]: 'Исполнитель',
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${styles[role]}`}>
      {labels[role]}
    </span>
  );
};

export default RoleBadge;
