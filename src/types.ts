export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 
  | 'execute' 
  | 'unclear' 
  | 'skill_gap' 
  | 'constraint' 
  | 'emotional' 
  | 'optional' 
  | 'resistance' 
  | 'bottleneck';

export interface ProblemLogEntry {
  id: string;
  text: string;
  status: 'active' | 'refined' | 'converted';
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  endGoal?: string;
  stages: Stage[];
  axes: Axis[];
  checklists: DashboardChecklist[];
  kpis: KPI[];
  problemLog: ProblemLogEntry[];
}

export interface DashboardChecklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  subItems?: ChecklistItem[];
}

export interface KPI {
  id: string;
  label: string;
  value: string;
}

export interface SubMilestone {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  gateCondition: string;
  gateTarget: string;
  subMilestones: SubMilestone[];
}

export interface Axis {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  status: TaskStatus;
  projectId: string;
  stageId: string;
  subMilestoneId: string;
  axisId: string;
  createdAt: number;
  tags: string[];
  notes?: string;
  dueDate?: string;
  dependsOn?: string;
  isExpanded?: boolean;
  subtasks: Subtask[];
}

export interface StatusConfig {
  label: string;
  emoji: string;
  color: string;
  description: string;
  action: string;
}
