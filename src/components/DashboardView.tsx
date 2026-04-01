import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Check, X, Trash2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Project, KPI, DashboardChecklist, ProblemLogEntry } from '../types';

interface DashboardViewProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onAddProblem: (text: string) => void;
  onConvertProblem: (problem: ProblemLogEntry) => void;
  onDeleteProblem: (id: string) => void;
}

export function DashboardView({ 
  project, 
  onUpdateProject,
  onAddProblem,
  onConvertProblem,
  onDeleteProblem
}: DashboardViewProps) {
  const [problemInput, setProblemInput] = useState('');

  const addKPI = () => {
    const label = prompt('KPI Label:');
    if (label) {
      const newKPI: KPI = { id: crypto.randomUUID(), label, value: '0' };
      onUpdateProject({ ...project, kpis: [...(project.kpis || []), newKPI] });
    }
  };

  const updateKPI = (id: string, value: string) => {
    const newKPIs = project.kpis.map(k => k.id === id ? { ...k, value } : k);
    onUpdateProject({ ...project, kpis: newKPIs });
  };

  const deleteKPI = (id: string) => {
    const newKPIs = project.kpis.filter(k => k.id !== id);
    onUpdateProject({ ...project, kpis: newKPIs });
  };

  const addChecklist = () => {
    const name = prompt('Checklist Name:');
    if (name) {
      const newCL: DashboardChecklist = { id: crypto.randomUUID(), name, items: [] };
      onUpdateProject({ ...project, checklists: [...(project.checklists || []), newCL] });
    }
  };

  const deleteChecklist = (id: string) => {
    const newCls = project.checklists.filter(c => c.id !== id);
    onUpdateProject({ ...project, checklists: newCls });
  };

  const addItem = (checklistId: string, text: string, parentId?: string) => {
    const newItem = { id: crypto.randomUUID(), text, completed: false, subItems: [] };
    const newCls = project.checklists.map(cl => {
      if (cl.id !== checklistId) return cl;
      if (!parentId) return { ...cl, items: [...cl.items, newItem] };
      return {
        ...cl,
        items: cl.items.map(item => item.id === parentId ? { ...item, subItems: [...(item.subItems || []), newItem] } : item)
      };
    });
    onUpdateProject({ ...project, checklists: newCls });
  };

  const toggleItem = (checklistId: string, itemId: string, subItemId?: string) => {
    const newCls = project.checklists.map(cl => {
      if (cl.id !== checklistId) return cl;
      return {
        ...cl,
        items: cl.items.map(item => {
          if (!subItemId) {
            if (item.id === itemId) return { ...item, completed: !item.completed };
            return item;
          }
          if (item.id === itemId) {
            return {
              ...item,
              subItems: item.subItems?.map(sub => sub.id === subItemId ? { ...sub, completed: !sub.completed } : sub)
            };
          }
          return item;
        })
      };
    });
    onUpdateProject({ ...project, checklists: newCls });
  };

  const updateItemText = (checklistId: string, itemId: string, text: string, subItemId?: string) => {
    const newCls = project.checklists.map(cl => {
      if (cl.id !== checklistId) return cl;
      return {
        ...cl,
        items: cl.items.map(item => {
          if (!subItemId) {
            if (item.id === itemId) return { ...item, text };
            return item;
          }
          if (item.id === itemId) {
            return {
              ...item,
              subItems: item.subItems?.map(sub => sub.id === subItemId ? { ...sub, text } : sub)
            };
          }
          return item;
        })
      };
    });
    onUpdateProject({ ...project, checklists: newCls });
  };

  const deleteItem = (checklistId: string, itemId: string, subItemId?: string) => {
    const newCls = project.checklists.map(cl => {
      if (cl.id !== checklistId) return cl;
      return {
        ...cl,
        items: cl.items.map(item => {
          if (!subItemId) {
            if (item.id === itemId) return null;
            return item;
          }
          if (item.id === itemId) {
            return {
              ...item,
              subItems: item.subItems?.filter(sub => sub.id !== subItemId)
            };
          }
          return item;
        }).filter(Boolean) as any
      };
    });
    onUpdateProject({ ...project, checklists: newCls });
  };

  return (
    <div className="space-y-16 pb-32">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Project Intelligence</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic Oversight & Operational Health</p>
        </div>
      </div>

      {/* KPIs Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Key Performance Indicators</h3>
          </div>
          <button 
            onClick={addKPI}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Metric
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(project.kpis || []).map(kpi => (
            <div key={kpi.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 group relative hover:shadow-xl hover:border-indigo-100 transition-all">
              <button 
                onClick={() => deleteKPI(kpi.id)}
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all bg-slate-50 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3">{kpi.label}</span>
              <input 
                value={kpi.value}
                onChange={(e) => updateKPI(kpi.id, e.target.value)}
                className="text-4xl font-black text-slate-900 bg-transparent outline-none w-full tracking-tighter"
              />
              <div className="mt-4 h-1 w-12 bg-indigo-100 rounded-full group-hover:w-full transition-all duration-500" />
            </div>
          ))}
          {(project.kpis || []).length === 0 && (
            <div className="lg:col-span-4 py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No strategic metrics defined for this operation.</p>
            </div>
          )}
        </div>
      </section>

      {/* Checklists Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Operational Checklists</h3>
          </div>
          <button 
            onClick={addChecklist}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Protocol
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {(project.checklists || []).map(cl => {
            const calculateProgress = () => {
              if (cl.items.length === 0) return 0;
              let total = 0;
              let completed = 0;
              cl.items.forEach(item => {
                total += 1;
                if (item.completed) completed += 1;
                item.subItems?.forEach(sub => {
                  total += 1;
                  if (sub.completed) completed += 1;
                });
              });
              return (completed / total) * 100;
            };
            const progress = calculateProgress();

            return (
              <div key={cl.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-6">
                    <input 
                      value={cl.name}
                      onChange={(e) => {
                        const newCls = project.checklists.map(c => c.id === cl.id ? { ...c, name: e.target.value } : c);
                        onUpdateProject({ ...project, checklists: newCls });
                      }}
                      className="text-lg font-black text-slate-900 bg-transparent outline-none flex-1 tracking-tight uppercase italic"
                    />
                    <button onClick={() => deleteChecklist(cl.id)} className="p-2 text-slate-300 hover:text-rose-500 bg-white rounded-xl shadow-sm"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span>Completion</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1 space-y-6">
                  <div className="space-y-2">
                    {cl.items.map(item => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center gap-4 p-3 rounded-2xl transition-all hover:bg-slate-50 group border border-transparent hover:border-slate-100">
                          <button 
                            onClick={() => toggleItem(cl.id, item.id)}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'border-slate-200 bg-white'}`}
                          >
                            {item.completed && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <input 
                            value={item.text}
                            onChange={(e) => updateItemText(cl.id, item.id, e.target.value)}
                            className={`text-sm font-bold flex-1 bg-transparent outline-none tracking-tight ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
                          />
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => {
                                const text = prompt('Enter sub-item text:');
                                if (text) addItem(cl.id, text, item.id);
                              }}
                              className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg shadow-sm transition-all"
                              title="Add Sub-item"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteItem(cl.id, item.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg shadow-sm transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {item.subItems?.map(sub => (
                          <div key={sub.id} className="flex items-center gap-4 p-2.5 rounded-2xl transition-all hover:bg-slate-50 group ml-8 border border-transparent hover:border-slate-100">
                            <button 
                              onClick={() => toggleItem(cl.id, item.id, sub.id)}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${sub.completed ? 'bg-emerald-400 border-emerald-400 text-white shadow-md shadow-emerald-50' : 'border-slate-200 bg-white'}`}
                            >
                              {sub.completed && <Check className="w-3 h-3" />}
                            </button>
                            <input 
                              value={sub.text}
                              onChange={(e) => updateItemText(cl.id, item.id, e.target.value, sub.id)}
                              className={`text-[13px] font-bold flex-1 bg-transparent outline-none tracking-tight ${sub.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}
                            />
                            <button 
                              onClick={() => deleteItem(cl.id, item.id, sub.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-4">
                    <input 
                      type="text"
                      placeholder="Add protocol item..."
                      className="flex-1 bg-slate-50 border border-transparent rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addItem(cl.id, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Problem Log Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Friction & Problem Log</h3>
          </div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Surface friction → Convert to directives</span>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-10 hover:shadow-xl transition-all">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Identify operational friction... (e.g. 'Bottleneck in QA process')"
              value={problemInput}
              onChange={(e) => setProblemInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && problemInput.trim()) {
                  onAddProblem(problemInput.trim());
                  setProblemInput('');
                }
              }}
              className="flex-1 bg-slate-50 border border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-bold outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-inner"
            />
            <button 
              onClick={() => {
                if (problemInput.trim()) {
                  onAddProblem(problemInput.trim());
                  setProblemInput('');
                }
              }}
              className="bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
            >
              Log Friction
            </button>
          </div>

          <div className="space-y-4">
            {(project.problemLog || []).length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-50 rounded-[2.5rem] bg-slate-50/30">
                <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No operational friction detected. System clear.</p>
              </div>
            ) : (
              project.problemLog.map(problem => (
                <div key={problem.id} className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all ${problem.status === 'converted' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-indigo-100 shadow-sm'}`}>
                  <div className={`p-3 rounded-xl shadow-sm ${problem.status === 'converted' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {problem.status === 'converted' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-base font-bold tracking-tight ${problem.status === 'converted' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{problem.text}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      Detected {new Date(problem.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {problem.status !== 'converted' && (
                      <button 
                        onClick={() => onConvertProblem(problem)}
                        className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        Refine to Directive
                      </button>
                    )}
                    <button 
                      onClick={() => onDeleteProblem(problem.id)}
                      className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
