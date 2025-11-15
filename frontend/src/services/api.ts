import axios from 'axios';
import type {
  LoginResponse,
  SuggestionsResponse,
  CreateInstanceResponse,
  ChatResponse,
  FeedbackResponse,
  Message,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session token to requests
apiClient.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

export const api = {
  // Authentication
  async login(email: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/login', { email });
    if (data.session_id) {
      localStorage.setItem('session_id', data.session_id);
    }
    return data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('session_id');
  },

  // Agent suggestions
  async getSuggestions(): Promise<SuggestionsResponse> {
    const { data } = await apiClient.get<SuggestionsResponse>('/agents/suggestions');
    return data;
  },

  // Agent instances
  async createInstance(templateId: string): Promise<CreateInstanceResponse> {
    const { data } = await apiClient.post<CreateInstanceResponse>('/agents/instances', {
      template_id: templateId,
    });
    return data;
  },

  async getInstances() {
    const { data } = await apiClient.get('/agents/instances');
    return data;
  },

  // Chat
  async getChatHistory(agentInstanceId: string): Promise<{ success: boolean; messages: Message[] }> {
    const { data } = await apiClient.get(`/chat/history?agent_instance_id=${agentInstanceId}`);
    return data;
  },

  async sendMessage(agentInstanceId: string, text: string): Promise<ChatResponse> {
    const { data } = await apiClient.post<ChatResponse>('/chat/send', {
      agent_instance_id: agentInstanceId,
      text,
    });
    return data;
  },

  // Feedback
  async submitFeedback(
    messageId: string,
    agentInstanceId: string,
    label: 'up' | 'down'
  ): Promise<FeedbackResponse> {
    const { data } = await apiClient.post<FeedbackResponse>('/feedback', {
      message_id: messageId,
      agent_instance_id: agentInstanceId,
      label,
    });
    return data;
  },

  // Self-improvement
  async triggerSelfImprovement(): Promise<{ success: boolean }> {
    const { data } = await apiClient.post('/self_improve');
    return data;
  },
};
