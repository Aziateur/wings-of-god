import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  Tag,
  Plus,
  X,
  FileText,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Task, Priority, TaskStatus, Subtask } from '../types';
import { STATUS_CONFIG } from '../constants';

interface TaskCardProps {
  task: Task;
  isCompactView: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isCompactView,
  onToggleComplete,
  onDelete,
  onToggleExpand,
  onUpdateNotes,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask
}) => {
  const [subtaskInput, setSubtaskInput] = React.useState('');

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (subtaskInput.trim()) {
      onAddSubtask(task.id, subtaskInput.trim());
      setSubtaskInput('');
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group bg-white rounded-[2rem] border transition-all relative overflow-hidden ${task.completed ? 'border-transparent bg-slate-50/50 opacity-60' : 'border-slate-100 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] shadow-sm'}`}
    >
      {/* Status Accent Bar */}
      {!task.completed && (
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${STATUS_CONFIG[task.status].color.split(' ')[0]}`} />
      )}

      <div className={`p-6 ${isCompactView ? 'py-3' : ''}`}>
        <div className="flex items-start gap-5">
          <button 
            onClick={() => onToggleComplete(task.id)}
            className={`mt-1.5 shrink-0 transition-all transform active:scale-90 ${task.completed ? 'text-emerald-500' : 'text-slate-200 hover:text-indigo-500'}`}
          >
            {task.completed ? (
              <div className="bg-emerald-50 p-1 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <h3 className={`text-base font-bold leading-tight tracking-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.text}
                </h3>
                
                {!isCompactView && (
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${STATUS_CONFIG[task.status].color}`}>
                      <span className="text-xs">{STATUS_CONFIG[task.status].emoji}</span>
                      <span>{STATUS_CONFIG[task.status].label}</span>
                    </div>
                    
                    {task.priority === 'high' && (
                      <div className="flex items-center gap-1.5 text-rose-500 font-black text-[10px] uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3 h-3" />
                        Priority Alpha
                      </div>
                    )}

                    {task.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        {task.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                            #{tag}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">+{task.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <button 
                  onClick={() => onToggleExpand(task.id)}
                  className={`p-2.5 transition-colors rounded-xl ${task.isExpanded ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                  {task.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => onDelete(task.id)}
                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {task.isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 mt-6 border-t border-slate-50 space-y-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <FileText className="w-3.5 h-3.5" />
                        Operational Intelligence
                      </div>
                      <textarea 
                        value={task.notes || ''}
                        onChange={(e) => onUpdateNotes(task.id, e.target.value)}
                        placeholder="Add execution parameters, links, or context..."
                        className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium outline-none focus:bg-white border border-transparent focus:border-indigo-100 transition-all min-h-[100px] resize-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <div className="flex items-center gap-2">
                          <Plus className="w-3.5 h-3.5" />
                          Sub-Directives
                        </div>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                      </div>
                      
                      <div className="space-y-2">
                        {task.subtasks.map(sub => (
                          <div key={sub.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 group/sub transition-colors border border-transparent hover:border-slate-100">
                            <button 
                              onClick={() => onToggleSubtask(task.id, sub.id)}
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${sub.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'border-slate-200 bg-white'}`}
                            >
                              {sub.completed && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <span className={`text-sm font-bold flex-1 tracking-tight ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              {sub.text}
                            </span>
                            <button 
                              onClick={() => onDeleteSubtask(task.id, sub.id)}
                              className="opacity-0 group-hover/sub:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAddSubtask} className="flex gap-3">
                        <input 
                          type="text"
                          placeholder="Deploy sub-directive..."
                          value={subtaskInput}
                          onChange={(e) => setSubtaskInput(e.target.value)}
                          className="flex-1 bg-slate-50 border border-transparent rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-inner"
                        />
                        <button type="submit" className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                          <Plus className="w-5 h-5" />
                        </button>
                      </form>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl">
                          <Play className="w-3 h-3" />
                          Deadline: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
