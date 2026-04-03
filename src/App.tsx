/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, 
  Plus, 
  Search, 
  Zap, 
  Folder, 
  X, 
  Layers, 
  Target,
  Anchor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';

import { 
  Priority, 
  TaskStatus, 
  ProblemLogEntry, 
  Project, 
  SubMilestone, 
  Stage, 
  Axis, 
  Subtask, 
  Task,
  StatusConfig
} from './types';

import { STATUS_CONFIG, DEFAULT_STAGES, DEFAULT_AXES } from './constants';
import { ListView } from './components/ListView';
import { DashboardView } from './components/DashboardView';
import { FocusView } from './components/FocusView';
import { MapView } from './components/MapView';

const FALLBACK_PROJECT: Project = {
  id: 'inbox',
  name: 'Inbox',
  color: '#6B7280',
  stages: DEFAULT_STAGES,
  axes: DEFAULT_AXES,
  checklists: [],
  kpis: [],
  problemLog: []
};

const PROJECT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'
];

export default function App() {
const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchData = async () => {
      const { data, error } = await supabase.from('wog_app_state').select('*').eq('id', 1).single();
      
      let finalProjects: Project[] = [];
      let finalTasks: Task[] = [];
      let needsMigration = false;

      // Check if we have valuable data in localStorage that hasn't been migrated yet
      const localProjectsString = localStorage.getItem('ideaflow_projects_v5');
      const localTasksString = localStorage.getItem('ideaflow_tasks_v5');
      
      let localProjects: Project[] = [];
      let localTasks: Task[] = [];
      
      try {
        if (localProjectsString) localProjects = JSON.parse(localProjectsString);
        if (localTasksString) localTasks = JSON.parse(localTasksString);
      } catch (e) {
        console.error("Local storage decode error", e);
      }

      // If Supabase has data, what do we do?
      // Check if Supabase is essentially empty (only 0 or 1 projects, and it's the Inbox)
      const isSupabaseEmpty = !data || !data.projects || data.projects.length === 0 || 
                              (data.projects.length === 1 && data.projects[0].id === 'inbox');
                              
      const hasValuableLocalData = localProjects.length > 1; // More than just Inbox

      if (isSupabaseEmpty && hasValuableLocalData) {
        // MIGRATION SCENARIO: Upload local data to Supabase
        console.log("Migrating local data to Supabase!");
        finalProjects = localProjects;
        finalTasks = localTasks;
        needsMigration = true;
      } else if (!error && data) {
        // NORMAL SCENARIO: Supabase has our real data
        finalProjects = data.projects || [];
        finalTasks = data.tasks || [];
      } else {
        // FALLBACK: Completely empty
        finalProjects = localProjects.length > 0 ? localProjects : [{ 
          id: 'inbox', name: 'Inbox', color: '#6B7280', stages: DEFAULT_STAGES, axes: DEFAULT_AXES, checklists: [], kpis: [], problemLog: [] 
        }];
        finalTasks = localTasks;
        needsMigration = true;
      }

      setProjects(finalProjects);
      setTasks(finalTasks);

      if (needsMigration) {
        await supabase.from('wog_app_state').update({
          projects: finalProjects,
          tasks: finalTasks,
          updated_at: new Date().toISOString()
        }).eq('id', 1);
      }
      setIsLoaded(true);
    };
    fetchData();

    // 2. Subscribe to remote changes
    const channel = supabase
      .channel('wog_state_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wog_app_state', filter: 'id=eq.1' }, (payload) => {
        if (payload.new) {
          setProjects(payload.new.projects || []);
          setTasks(payload.new.tasks || []);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const [viewMode, setViewMode] = useState<'list' | 'map' | 'dashboard' | 'focus'>('map');
  const [isCompactView, setIsCompactView] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState('all');
  const [inputValue, setInputValue] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('inbox');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('execute');
  
  const currentProject = useMemo(() => {
    if (projects.length === 0) return FALLBACK_PROJECT;
    return projects.find(p => p.id === (activeProjectId === 'all' ? 'inbox' : activeProjectId)) || projects[0] || FALLBACK_PROJECT;
  }, [projects, activeProjectId]);

  const stages = currentProject?.stages || DEFAULT_STAGES;
  const axes = currentProject?.axes || DEFAULT_AXES;

  const [selectedStageId, setSelectedStageId] = useState(stages[0]?.id || '');
  const [selectedSubMilestoneId, setSelectedSubMilestoneId] = useState('');
  const [selectedAxisId, setSelectedAxisId] = useState(axes[0]?.id || '');

  useEffect(() => {
    if (activeProjectId !== 'all') {
      setSelectedProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (stages.length > 0 && !stages.find(s => s.id === selectedStageId)) {
      setSelectedStageId(stages[0].id);
    }
    if (axes.length > 0 && !axes.find(a => a.id === selectedAxisId)) {
      setSelectedAxisId(axes[0].id);
    }
  }, [stages, axes, selectedStageId, selectedAxisId]);

  // Update selectedSubMilestoneId when selectedStageId changes
  useEffect(() => {
    const stage = stages.find(s => s.id === selectedStageId);
    if (stage && stage.subMilestones.length > 0) {
      if (!stage.subMilestones.find(sm => sm.id === selectedSubMilestoneId)) {
        setSelectedSubMilestoneId(stage.subMilestones[0].id);
      }
    } else {
      setSelectedSubMilestoneId('');
    }
  }, [selectedStageId, stages, selectedSubMilestoneId]);

  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [dueDateInput, setDueDateInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isConfiguringRoadmap, setIsConfiguringRoadmap] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedDependsOn, setSelectedDependsOn] = useState<string>('');

  const currentStageIndex = useMemo(() => {
    for (let i = 0; i < stages.length; i++) {
      const stageTasks = tasks.filter(t => t.stageId === stages[i].id && t.projectId === currentProject.id);
      if (stageTasks.length === 0 || stageTasks.some(t => !t.completed)) {
        return i;
      }
    }
    return stages.length - 1;
  }, [stages, tasks, currentProject.id]);

  const activeTasksCount = useMemo(() => {
    return tasks.filter(t => t.status === 'execute' && !t.completed && t.projectId === currentProject.id).length;
  }, [tasks, currentProject.id]);

  const advanceTasksCount = useMemo(() => {
    const nextStage = stages[currentStageIndex + 1];
    if (!nextStage) return 0;
    return tasks.filter(t => t.stageId === nextStage.id && t.projectId === currentProject.id).length;
  }, [stages, tasks, currentStageIndex, currentProject.id]);

  // Save to Supabase whenever projects or tasks change
  useEffect(() => {
    if (!isLoaded) return;
    
    // Also save to local storage as a quick backup
    localStorage.setItem('ideaflow_projects_v5', JSON.stringify(projects));
    localStorage.setItem('ideaflow_tasks_v5', JSON.stringify(tasks));
    
    const saveState = async () => {
      await supabase.from('wog_app_state').update({
        projects,
        tasks,
        updated_at: new Date().toISOString()
      }).eq('id', 1);
    };
    
    // Debounce to prevent slamming the database on every keystroke
    const timeout = setTimeout(saveState, 500);
    return () => clearTimeout(timeout);
  }, [projects, tasks, isLoaded]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Enforce constraints
    const isNextStage = stages.findIndex(s => s.id === selectedStageId) > currentStageIndex;
    const isExecute = selectedStatus === 'execute';

    if (isExecute && activeTasksCount >= 5) {
      alert('Constraint: No more than 5 tasks can be in "Execute" status at the same time.');
      return;
    }

    if (isNextStage) {
      const targetStageIndex = stages.findIndex(s => s.id === selectedStageId);
      if (targetStageIndex > currentStageIndex + 1) {
        alert('Constraint: You cannot add tasks to stages beyond the next immediate stage.');
        return;
      }
      if (advanceTasksCount >= 3) {
        alert('Constraint: No more than 3 tasks can be planned "in advance" (next stage).');
        return;
      }
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      projectId: selectedProjectId,
      stageId: selectedStageId,
      subMilestoneId: selectedSubMilestoneId,
      axisId: selectedAxisId,
      status: selectedStatus,
      priority: selectedPriority,
      dueDate: dueDateInput || null,
      notes: notesInput,
      tags: currentTags,
      completed: false,
      createdAt: Date.now(),
      subtasks: [],
      isExpanded: false,
      dependsOn: selectedDependsOn || undefined,
    };

    setTasks([newTask, ...tasks]);
    setInputValue('');
    setNotesInput('');
    setDueDateInput('');
    setCurrentTags([]);
    setSelectedDependsOn('');
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
      stages: [...DEFAULT_STAGES],
      axes: [...DEFAULT_AXES],
      checklists: [],
      kpis: [],
      problemLog: []
    };
    setProjects([...projects, newProj]);
    setNewProjectName('');
    setIsAddingProject(false);
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleExpand = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isExpanded: !t.isExpanded } : t));
  };

  const addSubtask = (taskId: string, text: string) => {
    if (!text?.trim()) return;

    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
    };

    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, subtasks: [...t.subtasks, newSubtask] } 
        : t
    ));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { 
            ...t, 
            subtasks: t.subtasks.map(st => 
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ) 
          } 
        : t
    ));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) } 
        : t
    ));
  };

  const updateTaskNotes = (taskId: string, notes: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, notes } : t));
  };

  const moveTask = (taskId: string, stageId: string, subMilestoneId: string, axisId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, stageId, subMilestoneId, axisId } : t));
  };

  const deleteProject = (id: string) => {
    if (id === 'inbox') return; // Don't delete Inbox
    setProjects(projects.filter(p => p.id !== id));
    setTasks(tasks.map(t => t.projectId === id ? { ...t, projectId: 'inbox' } : t));
    if (activeProjectId === id) setActiveProjectId('all');
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  const addTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setCurrentTags([...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setCurrentTags(currentTags.filter(t => t !== tag));
  };

  const updateProjectGoal = (projectId: string, endGoal: string) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, endGoal } : p));
  };

  const updateProjectRoadmap = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const addStage = () => {
    const newStage: Stage = {
      id: crypto.randomUUID(),
      name: 'New Stage',
      order: stages.length,
      gateCondition: 'Condition',
      gateTarget: 'Target',
      subMilestones: [
        { id: crypto.randomUUID(), name: 'Initial Step', description: 'First step of this stage', order: 0 }
      ]
    };
    updateProjectRoadmap(currentProject.id, { stages: [...stages, newStage] });
  };

  const updateStage = (id: string, updates: Partial<Stage>) => {
    const newStages = stages.map(s => s.id === id ? { ...s, ...updates } : s);
    updateProjectRoadmap(currentProject.id, { stages: newStages });
  };

  const deleteStage = (id: string) => {
    if (stages.length <= 1) return;
    const newStages = stages.filter(s => s.id !== id);
    updateProjectRoadmap(currentProject.id, { stages: newStages });
  };

  const addSubMilestone = (stageId: string) => {
    const newStages = stages.map(s => {
      if (s.id !== stageId) return s;
      const newSM: SubMilestone = {
        id: crypto.randomUUID(),
        name: 'New Sub-milestone',
        description: 'Description',
        order: s.subMilestones.length
      };
      return { ...s, subMilestones: [...s.subMilestones, newSM] };
    });
    updateProjectRoadmap(currentProject.id, { stages: newStages });
  };

  const updateSubMilestone = (stageId: string, smId: string, updates: Partial<SubMilestone>) => {
    const newStages = stages.map(s => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        subMilestones: s.subMilestones.map(sm => sm.id === smId ? { ...sm, ...updates } : sm)
      };
    });
    updateProjectRoadmap(currentProject.id, { stages: newStages });
  };

  const deleteSubMilestone = (stageId: string, smId: string) => {
    const newStages = stages.map(s => {
      if (s.id !== stageId) return s;
      if (s.subMilestones.length <= 1) return s;
      return {
        ...s,
        subMilestones: s.subMilestones.filter(sm => sm.id !== smId)
      };
    });
    updateProjectRoadmap(currentProject.id, { stages: newStages });
  };

  const addAxis = () => {
    const newAxis: Axis = {
      id: crypto.randomUUID(),
      name: 'New Axis',
      description: 'Description',
      order: axes.length
    };
    updateProjectRoadmap(currentProject.id, { axes: [...axes, newAxis] });
  };

  const updateAxis = (id: string, updates: Partial<Axis>) => {
    const newAxes = axes.map(a => a.id === id ? { ...a, ...updates } : a);
    updateProjectRoadmap(currentProject.id, { axes: newAxes });
  };

  const deleteAxis = (id: string) => {
    if (axes.length <= 1) return;
    const newAxes = axes.filter(a => a.id !== id);
    updateProjectRoadmap(currentProject.id, { axes: newAxes });
  };

  const addProblem = (text: string) => {
    const newProblem: ProblemLogEntry = {
      id: crypto.randomUUID(),
      text,
      status: 'active',
      createdAt: Date.now()
    };
    updateProjectRoadmap(currentProject.id, { 
      problemLog: [...(currentProject.problemLog || []), newProblem] 
    });
  };

  const updateProblem = (id: string, updates: Partial<ProblemLogEntry>) => {
    const newLog = (currentProject.problemLog || []).map(p => p.id === id ? { ...p, ...updates } : p);
    updateProjectRoadmap(currentProject.id, { problemLog: newLog });
  };

  const deleteProblem = (id: string) => {
    const newLog = (currentProject.problemLog || []).filter(p => p.id !== id);
    updateProjectRoadmap(currentProject.id, { problemLog: newLog });
  };

  const convertProblemToTask = (problem: ProblemLogEntry) => {
    const firstStage = stages[0];
    const firstSM = firstStage?.subMilestones[0];
    const firstAxis = axes[0];

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: problem.text,
      projectId: currentProject.id,
      stageId: firstStage?.id || '',
      subMilestoneId: firstSM?.id || '',
      axisId: firstAxis?.id || '',
      status: 'unclear',
      priority: 'medium',
      dueDate: null,
      notes: `Converted from problem log on ${new Date().toLocaleDateString()}`,
      tags: ['problem-log'],
      completed: false,
      createdAt: Date.now(),
      subtasks: [],
      isExpanded: false,
    };
    setTasks([newTask, ...tasks]);
    updateProblem(problem.id, { status: 'converted' });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesProject = activeProjectId === 'all' || t.projectId === activeProjectId;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [tasks, searchQuery, activeProjectId, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-indigo-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar: Projects */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">
                Taskflow
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Strategic OS</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Projects</h3>
                <button 
                  onClick={() => setIsAddingProject(!isAddingProject)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {isAddingProject && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-2 mb-6 space-y-2"
                >
                  <input 
                    type="text" 
                    placeholder="New project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-3 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-slate-50"
                    onKeyDown={(e) => e.key === 'Enter' && addProject()}
                  />
                  <div className="flex gap-2">
                    <button onClick={addProject} className="flex-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl shadow-lg shadow-indigo-100">Add</button>
                    <button onClick={() => setIsAddingProject(false)} className="flex-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl">Cancel</button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-1">
                <button 
                  onClick={() => setActiveProjectId('all')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold ${activeProjectId === 'all' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Folder className="w-4 h-4" />
                  All Operations
                </button>
                {projects.map(proj => (
                  <div key={proj.id} className="group/proj relative">
                    <button 
                      onClick={() => setActiveProjectId(proj.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold ${activeProjectId === proj.id ? 'bg-white border border-slate-200 shadow-sm text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: proj.color }} />
                      <span className="truncate">{proj.name}</span>
                      <span className={`ml-auto text-[10px] font-black ${activeProjectId === proj.id ? 'text-indigo-500' : 'text-slate-300'}`}>
                        {tasks.filter(t => t.projectId === proj.id).length}
                      </span>
                    </button>
                    {proj.id !== 'inbox' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }}
                        className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover/proj:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={clearCompleted}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Purge Completed
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Navigation Bar */}
          <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-10 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isFocusMode ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  {isFocusMode ? 'Focus Protocol Active' : 'Standard Interface'}
                </span>
              </div>
              
              <div className="h-8 w-px bg-slate-200" />

              <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
                {[
                  { id: 'list', label: 'List', icon: Layers },
                  { id: 'map', label: 'Roadmap', icon: Target },
                  { id: 'focus', label: 'Focus', icon: Zap },
                  { id: 'dashboard', label: 'Status', icon: Anchor }
                ].map((mode) => (
                  <button 
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <mode.icon className="w-3.5 h-3.5" />
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`p-2.5 rounded-xl border transition-all ${isFocusMode ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-900 hover:text-slate-900'}`}
                title="Toggle Focus Mode"
              >
                <Zap className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsCompactView(!isCompactView)}
                className={`p-2.5 rounded-xl border transition-all ${isCompactView ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'}`}
                title="Toggle Compact View"
              >
                <Layers className="w-4 h-4" />
              </button>
              {viewMode === 'map' && (
                <button 
                  onClick={() => setIsConfiguringRoadmap(!isConfiguringRoadmap)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isConfiguringRoadmap ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Zap className="w-4 h-4" />
                  Configure
                </button>
              )}
            </div>
          </header>

          {/* View Container */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-10">
              {/* Contextual Action Bar */}
              {!isFocusMode && viewMode !== 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8">
                    <div className="relative group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search operations, tags, or objectives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white rounded-3xl border border-slate-200 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all shadow-sm text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <button 
                      onClick={() => setIsAddingTask(!isAddingTask)}
                      className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all group"
                    >
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      Deploy New Task
                    </button>
                  </div>
                </div>
              )}

              {/* Add Task Modal/Form Overlay */}
              <AnimatePresence>
                {isAddingTask && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-10 space-y-8 relative z-30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">Task Deployment</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configure operational parameters</p>
                      </div>
                      <button onClick={() => setIsAddingTask(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={addTask} className="space-y-8">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Objective</span>
                        <input 
                          type="text" 
                          placeholder="What needs to be executed?"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-base font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Strategic Stage</span>
                          <select 
                            value={selectedStageId}
                            onChange={(e) => setSelectedStageId(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
                          >
                            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Axis of Execution</span>
                          <select 
                            value={selectedAxisId}
                            onChange={(e) => setSelectedAxisId(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
                          >
                            {axes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operational Status</span>
                          <select 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as TaskStatus)}
                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
                          >
                            {(Object.entries(STATUS_CONFIG) as [TaskStatus, StatusConfig][]).map(([key, config]) => (
                              <option key={key} value={key}>{config.emoji} {config.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dependency</span>
                          <select 
                            value={selectedDependsOn}
                            onChange={(e) => setSelectedDependsOn(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                          >
                            <option value="">Independent Operation</option>
                            {tasks.filter(t => !t.completed && t.projectId === selectedProjectId).map(t => (
                              <option key={t.id} value={t.id}>{t.text.substring(0, 40)}...</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Context Tags</span>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Add tag..."
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                              className="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                            />
                            <button 
                              type="button"
                              onClick={addTag}
                              className="p-3.5 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                              <Plus className="w-5 h-5 text-slate-600" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {currentTags.map(tag => (
                              <span key={tag} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operational Intelligence (Notes)</span>
                        <textarea 
                          placeholder="Provide detailed execution parameters or context..."
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium min-h-[120px] resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => setIsAddingTask(false)}
                          className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                          Abort
                        </button>
                        <button 
                          type="submit"
                          className="px-12 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                        >
                          Confirm Deployment
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main View Content */}
              <div className="relative z-10">
                {viewMode === 'dashboard' && currentProject.id !== 'all' ? (
                  <DashboardView 
                    project={currentProject} 
                    onUpdateProject={(updated) => {
                      setProjects(projects.map(p => p.id === updated.id ? updated : p));
                    }} 
                    onAddProblem={addProblem}
                    onDeleteProblem={deleteProblem}
                    onConvertProblem={convertProblemToTask}
                  />
                ) : viewMode === 'focus' ? (
                  <FocusView 
                    project={currentProject}
                    tasks={tasks}
                    currentStageIndex={currentStageIndex}
                    onToggleComplete={toggleComplete}
                    onToggleExpand={toggleExpand}
                  />
                ) : viewMode === 'list' ? (
                  <ListView 
                    tasks={filteredTasks}
                    projects={projects}
                    activeProjectId={activeProjectId}
                    statusFilter={statusFilter}
                    isCompactView={isCompactView}
                    onToggleComplete={toggleComplete}
                    onToggleExpand={toggleExpand}
                    onDelete={deleteTask}
                    onUpdateNotes={updateTaskNotes}
                    onToggleSubtask={toggleSubtask}
                    onDeleteSubtask={deleteSubtask}
                    onAddSubtask={addSubtask}
                  />
                ) : (
                  <MapView 
                    project={currentProject}
                    tasks={tasks}
                    filteredTasks={filteredTasks}
                    stages={stages}
                    axes={axes}
                    currentStageIndex={currentStageIndex}
                    activeProjectId={activeProjectId}
                    isConfiguringRoadmap={isConfiguringRoadmap}
                    setIsConfiguringRoadmap={setIsConfiguringRoadmap}
                    isCompactView={isCompactView}
                    addStage={addStage}
                    updateStage={updateStage}
                    deleteStage={deleteStage}
                    addSubMilestone={addSubMilestone}
                    updateSubMilestone={updateSubMilestone}
                    deleteSubMilestone={deleteSubMilestone}
                    addAxis={addAxis}
                    updateAxis={updateAxis}
                    deleteAxis={deleteAxis}
                    updateProjectGoal={updateProjectGoal}
                    toggleExpand={toggleExpand}
                    onAddTask={(stageId, smId, axisId) => {
                      setSelectedStageId(stageId);
                      setSelectedSubMilestoneId(smId);
                      setSelectedAxisId(axisId);
                      setIsAddingTask(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

