import type { AgentTemplate, Message, UserProfile } from '../types';

// Mock agent templates for development
export const mockAgentTemplates: AgentTemplate[] = [
  {
    id: 'research_scout',
    name: 'Research Scout',
    description: 'Monitors topics & fetches live info from the web using Linkup.',
    default_tools: ['linkup', 'senso'],
    base_prompt: 'You are a research assistant that monitors topics and fetches real-time information.',
    avatar_url: 'https://img.freepik.com/free-vector/cute-robot-scientist-cartoon-icon-illustration_138676-3093.jpg',
    category: 'research',
  },
  {
    id: 'task_planner',
    name: 'Task Planner',
    description: 'Breaks down complex goals into actionable steps.',
    default_tools: ['planning'],
    base_prompt: 'You are a task planning assistant that helps break down complex goals.',
    avatar_url: 'https://img.freepik.com/free-vector/cute-robot-working-laptop-cartoon-icon-illustration_138676-2888.jpg',
    category: 'productivity',
  },
  {
    id: 'study_coach',
    name: 'Study Coach',
    description: 'Explains concepts and helps with learning.',
    default_tools: ['linkup', 'senso'],
    base_prompt: 'You are a study coach that explains concepts clearly and helps with learning.',
    avatar_url: 'https://img.freepik.com/free-vector/cute-robot-teacher-cartoon-icon-illustration_138676-2889.jpg',
    category: 'education',
  },
  {
    id: 'code_reviewer',
    name: 'Code Reviewer',
    description: 'Reviews code and suggests improvements.',
    default_tools: ['code_analysis'],
    base_prompt: 'You are a code review assistant that analyzes code and suggests improvements.',
    avatar_url: 'https://img.freepik.com/free-vector/cute-robot-coding-cartoon-icon-illustration_138676-2890.jpg',
    category: 'development',
  },
  {
    id: 'writing_assistant',
    name: 'Writing Assistant',
    description: 'Helps with writing and editing content.',
    default_tools: ['writing'],
    base_prompt: 'You are a writing assistant that helps improve and polish written content.',
    avatar_url: 'https://img.freepik.com/free-vector/cute-robot-writing-cartoon-icon-illustration_138676-2891.jpg',
    category: 'writing',
  },
];

// Mock messages for development
export const mockMessages: Message[] = [
  {
    id: 'msg_1',
    agent_instance_id: 'agent_inst_123',
    role: 'assistant',
    text: 'Hello! I\'m your Research Scout. I can help you find real-time information on any topic using Linkup. What would you like to research?',
    created_at: new Date().toISOString(),
  },
];

// Mock user profile
export const mockUserProfile: UserProfile = {
  user_email: 'user@example.com',
  updated_at: new Date().toISOString(),
  preferences: {
    preferred_agent_templates: [
      { id: 'research_scout', score: 0.9 },
      { id: 'task_planner', score: 0.7 },
      { id: 'study_coach', score: 0.6 },
    ],
    topics: {
      ai: 0.8,
      productivity: 0.7,
      research: 0.9,
    },
    tone: 'concise',
  },
};
