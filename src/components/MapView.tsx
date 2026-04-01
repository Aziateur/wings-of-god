import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Anchor, CheckCircle2, Circle, Zap, X, Trash2, Target, Plus } from 'lucide-react';
import { Project, Task, Stage, Axis } from '../types';
import { STATUS_CONFIG } from '../constants';

interface MapViewProps {
  project: Project;
  tasks: Task[];
  filteredTasks: Task[];
  stages: Stage[];
  axes: Axis[];
  currentStageIndex: number;
  activeProjectId: string;
  isConfiguringRoadmap: boolean;
  setIsConfiguringRoadmap: (val: boolean) => void;
  isCompactView: boolean;
  addStage: () => void;
  updateStage: (id: string, updates: Partial<Stage>) => void;
  deleteStage: (id: string) => void;
  addSubMilestone: (stageId: string) => void;
  updateSubMilestone: (stageId: string, smId: string, updates: Partial<{ name: string; description: string }>) => void;
  deleteSubMilestone: (stageId: string, smId: string) => void;
  addAxis: () => void;
  updateAxis: (id: string, updates: Partial<Axis>) => void;
  deleteAxis: (id: string) => void;
  updateProjectGoal: (projectId: string, goal: string) => void;
  toggleExpand: (id: string) => void;
  onAddTask: (stageId: string, smId: string, axisId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  project,
  tasks,
  filteredTasks,
  stages,
  axes,
  currentStageIndex,
  activeProjectId,
  isConfiguringRoadmap,
  setIsConfiguringRoadmap,
  isCompactView,
  addStage,
  updateStage,
  deleteStage,
  addSubMilestone,
  updateSubMilestone,
  deleteSubMilestone,
  addAxis,
  updateAxis,
  deleteAxis,
  updateProjectGoal,
  toggleExpand,
  onAddTask,
}) => {
  return (
    <div className="space-y-6">
      {isConfiguringRoadmap && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Roadmap Configuration
            </h3>
            <button onClick={() => setIsConfiguringRoadmap(false)} className="text-gray-400 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stages Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Stages (Columns)</h4>
                <button onClick={addStage} className="p-1 hover:bg-gray-100 rounded-md text-indigo-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-6">
                {stages.map((stage, idx) => (
                  <div key={stage.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative group">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-400">#{idx + 1}</span>
                      <input 
                        type="text" 
                        value={stage.name}
                        onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                        className="flex-1 bg-transparent text-sm font-bold outline-none border-b border-transparent focus:border-indigo-600"
                        placeholder="Stage Name"
                      />
                      <button onClick={() => deleteStage(stage.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400">Gate Condition</label>
                        <input 
                          type="text" 
                          value={stage.gateCondition || ''}
                          onChange={(e) => updateStage(stage.id, { gateCondition: e.target.value })}
                          className="w-full bg-white px-2 py-1.5 rounded-lg text-[10px] border border-gray-200 outline-none focus:border-indigo-600"
                          placeholder="e.g. Initial Proof"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400">Gate Target</label>
                        <input 
                          type="text" 
                          value={stage.gateTarget || ''}
                          onChange={(e) => updateStage(stage.id, { gateTarget: e.target.value })}
                          className="w-full bg-white px-2 py-1.5 rounded-lg text-[10px] border border-gray-200 outline-none focus:border-indigo-600"
                          placeholder="e.g. 1k/mo"
                        />
                      </div>
                    </div>

                    {/* Sub-milestones within Stage */}
                    <div className="pt-2 border-t border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black uppercase text-gray-400">Sub-milestones (Steps)</label>
                        <button onClick={() => addSubMilestone(stage.id)} className="p-1 hover:bg-gray-200 rounded-md text-indigo-600">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {stage.subMilestones.map((sm, smIdx) => (
                          <div key={sm.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 group/sm">
                            <span className="text-[8px] font-black text-gray-300">{smIdx + 1}</span>
                            <input 
                              type="text" 
                              value={sm.name}
                              onChange={(e) => updateSubMilestone(stage.id, sm.id, { name: e.target.value })}
                              className="flex-1 bg-transparent text-[10px] font-bold outline-none border-b border-transparent focus:border-indigo-600"
                              placeholder="Sub-milestone"
                            />
                            <button onClick={() => deleteSubMilestone(stage.id, sm.id)} className="opacity-0 group-hover/sm:opacity-100 text-gray-300 hover:text-rose-500">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Axes Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Axes (Rows)</h4>
                <button onClick={addAxis} className="p-1 hover:bg-gray-100 rounded-md text-indigo-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {axes.map((axis, idx) => (
                  <div key={axis.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 relative group">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-400">{String.fromCharCode(65 + idx)}</span>
                      <input 
                        type="text" 
                        value={axis.name}
                        onChange={(e) => updateAxis(axis.id, { name: e.target.value })}
                        className="flex-1 bg-transparent text-sm font-bold outline-none border-b border-transparent focus:border-indigo-600"
                        placeholder="Axis Name"
                      />
                      <button onClick={() => deleteAxis(axis.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={axis.description}
                      onChange={(e) => updateAxis(axis.id, { description: e.target.value })}
                      className="w-full bg-white px-2 py-1.5 rounded-lg text-[10px] border border-gray-200 outline-none focus:border-indigo-600"
                      placeholder="Description"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className={`bg-slate-50/50 rounded-[2rem] shadow-2xl border border-slate-200/60 overflow-x-auto transition-all duration-700 ${isCompactView ? 'scale-90 origin-top' : ''}`} style={{ backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        <div className={`${isCompactView ? 'min-w-full' : 'min-w-[1400px]'} p-10`}>
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Strategic Roadmap</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em]">Visualizing the path to victory</p>
            </div>
            <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-800">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 block mb-0.5">Flagship Outcome</span>
                <input 
                  type="text"
                  value={project?.endGoal || ''}
                  onChange={(e) => updateProjectGoal(activeProjectId === 'all' ? 'inbox' : activeProjectId, e.target.value)}
                  className="bg-transparent text-base font-bold outline-none border-b border-transparent focus:border-indigo-400 w-full min-w-[250px] placeholder:text-slate-700"
                  placeholder="Define ultimate mission objective..."
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: `240px repeat(${stages.reduce((acc, s) => acc + s.subMilestones.length, 0)}, 1fr)` }}>
            {/* Header Row */}
            <div className="flex items-end pb-4">
              <div className="w-full h-px bg-slate-200" />
            </div>
            {stages.map((stage, idx) => {
              const stageTasks = tasks.filter(t => t.stageId === stage.id);
              const completedTasks = stageTasks.filter(t => t.completed).length;
              const progress = stageTasks.length > 0 ? (completedTasks / stageTasks.length) * 100 : 0;
              const isLocked = idx > currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              
              return (
                <div key={stage.id} className="relative" style={{ gridColumn: `span ${stage.subMilestones.length}` }}>
                  <div className={`group relative bg-white border rounded-3xl p-5 shadow-sm transition-all duration-500 ${isLocked ? 'opacity-40 grayscale border-slate-200' : isCurrent ? 'border-indigo-600 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-900 rounded-full">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Stage 0{idx + 1}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3 pt-1">
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">{stage.name}</h4>
                      {isLocked ? (
                        <ShieldAlert className="w-4 h-4 text-slate-400" />
                      ) : isCurrent ? (
                        <Zap className="w-4 h-4 text-indigo-600 animate-pulse" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mb-4">
                      <Anchor className="w-3 h-3" />
                      <span className="uppercase tracking-wider">{stage.gateCondition}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-indigo-600">{stage.gateTarget}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={`h-full transition-colors duration-500 ${isCurrent ? 'bg-indigo-600' : progress === 100 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{Math.round(progress)}% Progress</span>
                        <span className="text-[9px] font-black text-slate-900">{completedTasks}/{stageTasks.length} Units</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Sub-milestone Header Row */}
            <div className="flex items-center justify-end pr-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operations</span>
            </div>
            {stages.map(stage => (
              <React.Fragment key={`sm-header-${stage.id}`}>
                {stage.subMilestones.map(sm => (
                  <div key={sm.id} className="text-center py-4 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{sm.name}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}

            {/* Axis Rows */}
            {axes.map((axis, aIdx) => (
              <React.Fragment key={axis.id}>
                <div className="flex flex-col justify-center pr-8 border-r border-slate-200 relative group/axis">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-slate-200 group-hover/axis:bg-indigo-500 transition-colors rounded-full" />
                  <div className="pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-indigo-500/50">0{aIdx + 1}</span>
                      <h5 className="text-sm font-black uppercase tracking-tight text-slate-900">{axis.name}</h5>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{axis.description}</p>
                  </div>
                </div>
                {stages.map((stage, sIdx) => (
                  <React.Fragment key={`${axis.id}-${stage.id}`}>
                    {stage.subMilestones.map(sm => {
                      const cellTasks = filteredTasks.filter(t => t.stageId === stage.id && t.subMilestoneId === sm.id && t.axisId === axis.id);
                      const isLocked = sIdx > currentStageIndex;
                      
                      return (
                        <div key={`${axis.id}-${stage.id}-${sm.id}`} className={`relative min-h-[180px] p-4 rounded-3xl transition-all duration-500 group/cell ${isLocked ? 'bg-slate-100/30' : 'bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50'}`}>
                          {isLocked ? (
                            <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-3xl border border-slate-200/50">
                              <div className="flex flex-col items-center gap-3 opacity-30 group-hover/cell:opacity-50 transition-opacity">
                                <ShieldAlert className="w-8 h-8 text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Locked</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {cellTasks.map((task, tIdx) => {
                                const dependency = tasks.find(t => t.id === task.dependsOn);
                                return (
                                  <motion.div 
                                    key={task.id} 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => toggleExpand(task.id)}
                                    className={`group/task bg-white p-4 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-indigo-200 hover:shadow-lg transition-all ${task.completed ? 'bg-slate-50/80' : ''}`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[task.status].color.split(' ')[0]} shadow-sm`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Unit {tIdx + 1}</span>
                                      </div>
                                      {dependency && (
                                        <div className="p-1 bg-indigo-50 rounded-lg">
                                          <Anchor className="w-3 h-3 text-indigo-500" />
                                        </div>
                                      )}
                                    </div>
                                    <p className={`text-xs font-bold leading-snug ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.text}</p>
                                    {dependency && (
                                      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1.5">
                                        <span className="text-[8px] font-black uppercase text-indigo-400">Prereq:</span>
                                        <p className="text-[9px] font-medium text-slate-400 truncate italic">{dependency.text}</p>
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                              <button 
                                onClick={() => onAddTask(stage.id, sm.id, axis.id)}
                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all opacity-0 group-hover/cell:opacity-100"
                              >
                                + Deploy Task
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}

            {/* Victory Gates Row */}
            <div className="flex items-center justify-end pr-8">
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block">Milestone</span>
                <span className="text-sm font-black uppercase italic text-slate-900">Victory Gates</span>
              </div>
            </div>
            {stages.map(stage => {
              const stageTasks = tasks.filter(t => t.stageId === stage.id && t.projectId === activeProjectId);
              const completedTasks = stageTasks.filter(t => t.completed).length;
              const isUnlocked = completedTasks >= stageTasks.length && stageTasks.length > 0;

              return (
                <div key={`gate-${stage.id}`} style={{ gridColumn: `span ${stage.subMilestones.length}` }} className={`p-6 rounded-[2rem] relative overflow-hidden group transition-all duration-500 ${isUnlocked ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200' : 'bg-slate-900 text-white shadow-2xl shadow-slate-200'} border border-white/10`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rotate-45 translate-x-16 -translate-y-16" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white/10 rounded-xl">
                        <Target className={`w-5 h-5 ${isUnlocked ? 'text-emerald-200' : 'text-indigo-400'}`} />
                      </div>
                      {isUnlocked ? (
                        <div className="px-3 py-1 bg-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest">Unlocked</div>
                      ) : (
                        <div className="px-3 py-1 bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">Locked</div>
                      )}
                    </div>
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Victory Condition</h5>
                    <p className="text-sm font-bold leading-tight mb-4">Reach {stage.gateTarget} with {stage.gateCondition}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className={`text-xs font-black uppercase tracking-widest ${isUnlocked ? 'text-emerald-200' : 'text-indigo-400'}`}>{stage.gateTarget}</span>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-6 h-6 text-white animate-bounce" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-700" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
