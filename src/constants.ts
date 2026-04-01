import { TaskStatus, StatusConfig, Stage, Axis } from './types';

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  execute: { 
    label: 'Execute', 
    emoji: '⚡', 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    description: 'Ready to do. Clear path, high energy.',
    action: 'Just do it now.'
  },
  unclear: { 
    label: 'Unclear', 
    emoji: '❓', 
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    description: 'Missing info or next step is fuzzy.',
    action: 'Define the next physical action.'
  },
  skill_gap: { 
    label: 'Skill Gap', 
    emoji: '🎓', 
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    description: 'Don\'t know HOW to do this yet.',
    action: 'Learn or delegate.'
  },
  constraint: { 
    label: 'Constraint', 
    emoji: '🧱', 
    color: 'bg-rose-50 text-rose-700 border-rose-100',
    description: 'External blocker (money, time, person).',
    action: 'Solve the bottleneck.'
  },
  emotional: { 
    label: 'Emotional', 
    emoji: '❤️', 
    color: 'bg-purple-50 text-purple-700 border-purple-100',
    description: 'Fear, anxiety, or lack of motivation.',
    action: 'Break it into a tiny, non-threatening step.'
  },
  optional: { 
    label: 'Optional', 
    emoji: '✨', 
    color: 'bg-slate-50 text-slate-700 border-slate-100',
    description: 'Nice to have, but not critical.',
    action: 'Move to backlog or delete.'
  },
  resistance: { 
    label: 'Resistance', 
    emoji: '🛡️', 
    color: 'bg-orange-50 text-orange-700 border-orange-100',
    description: 'Internal pushback or procrastination.',
    action: 'Identify the underlying fear.'
  },
  bottleneck: { 
    label: 'Bottleneck', 
    emoji: '⌛', 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    description: 'Critical path item blocking others.',
    action: 'Prioritize above all else.'
  }
};

export const DEFAULT_STAGES: Stage[] = [
  { 
    id: 'stage-1', 
    name: 'Validation', 
    order: 0, 
    gateCondition: 'Product/Market Fit', 
    gateTarget: '10 Paid Users',
    subMilestones: [
      { id: 'sm-1-1', name: 'Problem Interview', description: 'Talk to 5 potential users', order: 0 },
      { id: 'sm-1-2', name: 'Solution Demo', description: 'Show a prototype', order: 1 }
    ]
  },
  { 
    id: 'stage-2', 
    name: 'Growth', 
    order: 1, 
    gateCondition: 'Scalability', 
    gateTarget: '100 Paid Users',
    subMilestones: [
      { id: 'sm-2-1', name: 'Ad Campaign', description: 'Test Facebook ads', order: 0 },
      { id: 'sm-2-2', name: 'Referral Loop', description: 'Implement invite system', order: 1 }
    ]
  },
  { 
    id: 'stage-3', 
    name: 'Scale', 
    order: 2, 
    gateCondition: 'Profitability', 
    gateTarget: '$10k MRR',
    subMilestones: [
      { id: 'sm-3-1', name: 'Hiring', description: 'Hire first engineer', order: 0 },
      { id: 'sm-3-2', name: 'Automation', description: 'Automate onboarding', order: 1 }
    ]
  }
];

export const DEFAULT_AXES: Axis[] = [
  { id: 'axis-1', name: 'Offer', description: 'What are you selling?', order: 0 },
  { id: 'axis-2', name: 'Acquisition', description: 'How do they find you?', order: 1 },
  { id: 'axis-3', name: 'Delivery', description: 'How do you fulfill?', order: 2 }
];
