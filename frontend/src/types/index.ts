// User types
export interface User {
  email: string;
  created_at: string;
  display_name?: string;
  profile_last_updated?: string;
}

// Agent Template
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  default_tools: string[];
  base_prompt: string;
  avatar_url?: string;
  category?: string;
}

// Agent Instance
export interface AgentInstance {
  id: string;
  user_email: string;
  template_id: string;
  name: string;
  created_at: string;
  config: {
    airia_agentcard_id?: string;
    mcp_server_id?: string;
    raindrop_manifest_id?: string;
    extra_prefs?: Record<string, any>;
  };
  status: 'active' | 'archived';
}

// Message
export interface Message {
  id: string;
  agent_instance_id: string;
  role: 'user' | 'assistant';
  text: string;
  created_at: string;
  metadata?: {
    tools_used?: string[];
    source_urls?: string[];
    search_query?: string;
  };
}

// Feedback
export interface Feedback {
  id: string;
  message_id: string;
  agent_instance_id: string;
  user_email: string;
  label: 'up' | 'down';
  created_at: string;
}

// User Profile (Fastino-derived)
export interface UserProfile {
  user_email: string;
  updated_at: string;
  preferences: {
    preferred_agent_templates: Array<{
      id: string;
      score: number;
    }>;
    topics: Record<string, number>;
    tone?: string;
  };
}

// API Response types
export interface LoginResponse {
  success: boolean;
  user: User;
  profile: UserProfile;
  session_id: string;
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: AgentTemplate[];
}

export interface CreateInstanceResponse {
  success: boolean;
  instance: AgentInstance;
}

export interface ChatResponse {
  success: boolean;
  message: Message;
}

export interface FeedbackResponse {
  success: boolean;
  updated_profile?: UserProfile;
}
