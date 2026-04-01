import React from 'react';
import { AnimatePresence } from 'motion/react';
import { Search, Filter, Trash2, AlertTriangle } from 'lucide-react';
import { Task, Project, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface ListViewProps {
  tasks: Task[];
  projects: Project[];
  activeProjectId: string;
  statusFilter: TaskStatus | 'all';
  isCompactView: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export function ListView({
  tasks,
  projects,
  activeProjectId,
  statusFilter,
  isCompactView,
  onToggleComplete,
  onDelete,
  onToggleExpand,
  onUpdateNotes,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask
}: ListViewProps) {
  const filteredTasks = tasks.filter(task => {
    const matchesProject = activeProjectId === 'all' || task.projectId === activeProjectId;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesProject && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    }
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Operational Queue</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {sortedTasks.length} Active Directives in Current Sector
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Sector Clear</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No pending operations detected in this sector.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {sortedTasks.map(task => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  isCompactView={isCompactView}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onToggleExpand={onToggleExpand}
                  onUpdateNotes={onUpdateNotes}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
