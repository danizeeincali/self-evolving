import { RefreshCw } from 'lucide-react';
import { AgentCard } from './AgentCard';
import type { AgentTemplate, UserProfile } from '../types';

interface AgentGridProps {
  agents: AgentTemplate[];
  profile?: UserProfile;
  onSelectAgent: (agent: AgentTemplate) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function AgentGrid({ agents, profile, onSelectAgent, onRefresh, loading }: AgentGridProps) {
  // Get personalization scores if profile exists
  const getAgentScore = (agentId: string): number | undefined => {
    if (!profile) return undefined;
    const pref = profile.preferences.preferred_agent_templates.find(
      (p) => p.id === agentId
    );
    return pref?.score;
  };

  // Sort agents by personalization score (if available)
  const sortedAgents = profile
    ? [...agents].sort((a, b) => {
        const scoreA = getAgentScore(a.id) ?? 0;
        const scoreB = getAgentScore(b.id) ?? 0;
        return scoreB - scoreA;
      })
    : agents;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suggested Agents</h2>
          <p className="text-sm text-gray-600 mt-1">
            {profile
              ? 'Personalized recommendations based on your preferences'
              : 'Popular agents to get you started'}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {sortedAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            score={getAgentScore(agent.id)}
            onSelect={onSelectAgent}
          />
        ))}
      </div>

      {/* Empty State */}
      {agents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No agents available. Try refreshing.</p>
        </div>
      )}

      {/* Fastino Attribution */}
      {profile && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ✨ Personalized by <span className="font-semibold">Fastino</span> •
            Last updated: {new Date(profile.updated_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
