import { useState, useEffect } from 'react';
import { LoginView } from './components/LoginView';
import { AgentGrid } from './components/AgentGrid';
import { ChatView } from './components/ChatView';
import { api } from './services/api';
import { mockAgentTemplates, mockMessages } from './services/mockData';
import type { User, UserProfile, AgentTemplate, AgentInstance, Message } from './types';
import { LogOut, Menu } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [suggestions, setSuggestions] = useState<AgentTemplate[]>([]);
  const [instances, setInstances] = useState<AgentInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<AgentInstance | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load suggestions when user logs in
  useEffect(() => {
    if (user) {
      loadSuggestions();
      loadInstances();
    }
  }, [user]);

  // Load messages when instance is selected
  useEffect(() => {
    if (selectedInstance) {
      loadMessages(selectedInstance.id);
    }
  }, [selectedInstance]);

  const handleLogin = async (email: string) => {
    try {
      const response = await api.login(email);
      setUser(response.user);
      setProfile(response.profile);
    } catch (error) {
      // Fallback to mock data for development
      console.warn('API not available, using mock data');
      setUser({
        email,
        created_at: new Date().toISOString(),
        display_name: email.split('@')[0],
      });
      setSuggestions(mockAgentTemplates);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setProfile(null);
    setSuggestions([]);
    setInstances([]);
    setSelectedInstance(null);
    setMessages([]);
  };

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const response = await api.getSuggestions();
      setSuggestions(response.suggestions);
    } catch (error) {
      console.warn('Failed to load suggestions, using mock data');
      setSuggestions(mockAgentTemplates);
    } finally {
      setLoading(false);
    }
  };

  const loadInstances = async () => {
    try {
      const response = await api.getInstances();
      setInstances(response.instances || []);
    } catch (error) {
      console.error('Failed to load instances:', error);
    }
  };

  const loadMessages = async (instanceId: string) => {
    try {
      const response = await api.getChatHistory(instanceId);
      setMessages(response.messages || []);
    } catch (error) {
      console.warn('Failed to load messages, using mock data');
      setMessages(mockMessages);
    }
  };

  const handleSelectAgent = async (agent: AgentTemplate) => {
    try {
      const response = await api.createInstance(agent.id);
      const newInstance = response.instance;
      setInstances([...instances, newInstance]);
      setSelectedInstance(newInstance);
    } catch (error) {
      console.warn('Failed to create instance, using mock');
      const mockInstance: AgentInstance = {
        id: `inst_${Date.now()}`,
        user_email: user?.email || '',
        template_id: agent.id,
        name: agent.name,
        created_at: new Date().toISOString(),
        config: {},
        status: 'active',
      };
      setInstances([...instances, mockInstance]);
      setSelectedInstance(mockInstance);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedInstance) return;

    // Optimistic update
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      agent_instance_id: selectedInstance.id,
      role: 'user',
      text,
      created_at: new Date().toISOString(),
    };
    setMessages([...messages, userMessage]);

    try {
      const response = await api.sendMessage(selectedInstance.id, text);
      setMessages((prev) => [...prev, response.message]);
    } catch (error) {
      console.warn('Failed to send message, using mock response');
      const mockResponse: Message = {
        id: `msg_${Date.now()}_assistant`,
        agent_instance_id: selectedInstance.id,
        role: 'assistant',
        text: `I received your message: "${text}". This is a mock response because the backend is not connected yet. Once the Raindrop API and backend are ready, I'll use Linkup to search for real-time information!`,
        created_at: new Date().toISOString(),
        metadata: {
          tools_used: ['linkup'],
          search_query: text,
        },
      };
      setMessages((prev) => [...prev, mockResponse]);
    }
  };

  const handleFeedback = async (messageId: string, label: 'up' | 'down') => {
    if (!selectedInstance) return;

    try {
      const response = await api.submitFeedback(messageId, selectedInstance.id, label);
      if (response.updated_profile) {
        setProfile(response.updated_profile);
        // Reload suggestions to show evolution
        await loadSuggestions();
      }
    } catch (error) {
      console.warn('Failed to submit feedback');
    }
  };

  // Not logged in
  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Main app view
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Agent Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.display_name || user.email}</p>
              <p className="text-xs text-gray-500">
                {profile?.preferences.preferred_agent_templates.length || 0} preferences
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Agent Instances */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300`}
        >
          {sidebarOpen && (
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Agents</h2>
              <div className="space-y-2">
                {instances.map((instance) => (
                  <button
                    key={instance.id}
                    onClick={() => setSelectedInstance(instance)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedInstance?.id === instance.id
                        ? 'bg-primary-100 text-primary-900'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <p className="font-medium text-sm">{instance.name}</p>
                    <p className="text-xs opacity-70">{instance.template_id}</p>
                  </button>
                ))}
                {instances.length === 0 && (
                  <p className="text-sm text-gray-500">No agents yet. Create one below!</p>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-y-auto p-6">
          {selectedInstance ? (
            <div className="h-full">
              <ChatView
                agent={selectedInstance}
                messages={messages}
                onSendMessage={handleSendMessage}
                onFeedback={handleFeedback}
                loading={loading}
              />
            </div>
          ) : (
            <AgentGrid
              agents={suggestions}
              profile={profile || undefined}
              onSelectAgent={handleSelectAgent}
              onRefresh={loadSuggestions}
              loading={loading}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
