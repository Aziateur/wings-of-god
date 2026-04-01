import React from 'react';
import { motion } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import { Project, Task } from '../types';

interface FocusViewProps {
  project: Project;
  tasks: Task[];
  currentStageIndex: number;
  onToggleComplete: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export function FocusView({ 
  project, 
  tasks, 
  currentStageIndex,
  onToggleComplete,
}: FocusViewProps) {
  const currentStage = project.stages[currentStageIndex];
  if (!currentStage) return null;

  return (
    <div className="space-y-8">
      <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">Active Stage</div>
            <h2 className="text-4xl font-black tracking-tighter">{currentStage.name}</h2>
          </div>
          <p className="text-indigo-200 font-medium max-w-xl">
            Focus on the current milestone. Complete these sub-milestones to unlock the Fog of War for the next stage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentStage.subMilestones.map(sm => {
          const smTasks = tasks.filter(t => t.projectId === project.id && t.stageId === currentStage.id && t.subMilestoneId === sm.id);
          const completedCount = smTasks.filter(t => t.completed).length;
          const progress = smTasks.length > 0 ? (completedCount / smTasks.length) * 100 : 0;

          return (
            <div key={sm.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-black text-gray-900 mb-1">{sm.name}</h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4">{sm.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {smTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl">
                    <Plus className="w-6 h-6 text-gray-200 mb-2" />
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No tasks defined</p>
                  </div>
                ) : (
                  smTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${task.completed ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-md shadow-sm'}`}
                      onClick={() => onToggleComplete(task.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200'}`}>
                          {task.completed && <Check className="w-3 h-3" />}
                        </div>
                        <p className={`text-sm font-bold leading-tight ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
