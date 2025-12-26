
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SENIOR_PERFORMER = 'SENIOR_PERFORMER',
  PERFORMER = 'PERFORMER'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  WON = 'WON',
  LOST = 'LOST'
}

export interface Attachment {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 for demo
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex or CSS color
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  password?: string; // Added for user management
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
  createdBy: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  priority: 'Low' | 'Medium' | 'High';
  attachments?: Attachment[];
  // Financial fields
  cost: number;
  managerRate: number;
  performerRate: number;
  seniorPerformerRate: number;
}

export interface Lead {
  id: string;
  name: string;
  contact: string;
  description: string;
  cost: number;
  status: LeadStatus;
  createdAt: number;
}

export interface TaskLog {
  taskId: string;
  userId: string;
  action: 'START' | 'STOP';
  timestamp: number;
}
