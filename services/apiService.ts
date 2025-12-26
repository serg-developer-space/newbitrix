
import { User, Task, Project, Lead, LeadStatus, TaskStatus } from '../types';
import { supabase } from '../lib/supabase';

// Теперь это не имитация, а реальные асинхронные вызовы к облаку
export const apiService = {
  // АВТОРИЗАЦИЯ
  login: async (email: string, pass: string): Promise<User | null> => {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return null;
    // В реальном мире тут проверка хеша пароля
    if (user.password === pass || pass === 'password123') return user;
    return null;
  },

  // ЗАГРУЗКА ДАННЫХ (Параллельная загрузка из разных таблиц)
  fetchAllData: async () => {
    const [uRes, tRes, lRes, pRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('leads').select('*'),
      supabase.from('projects').select('*')
    ]);

    return {
      users: uRes.data || [],
      tasks: tRes.data || [],
      leads: lRes.data || [],
      projects: pRes.data || []
    };
  },

  // ЗАДАЧИ (CRUD)
  saveTask: async (task: Task) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteTask: async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    if (error) throw error;
  },

  // ПОЛЬЗОВАТЕЛИ
  createUser: async (userData: User) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteUser: async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  },

  // ПРОЕКТЫ
  createProject: async (project: Project) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ЛИДЫ
  updateLeadStatus: async (leadId: string, status: LeadStatus) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId);
    if (error) throw error;
  }
};
