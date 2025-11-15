import { Bot, Sparkles } from 'lucide-react';
import type { AgentTemplate } from '../types';

interface AgentCardProps {
  agent: AgentTemplate;
  onSelect: (agent: AgentTemplate) => void;
  score?: number;
}

export function AgentCard({ agent, onSelect, score }: AgentCardProps) {
  return (
    <div
      onClick={() => onSelect(agent)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-2 border-transparent hover:border-primary-500 group"
    >
      {/* Avatar */}
      <div className="flex items-center justify-center mb-4">
        {agent.avatar_url ? (
          <img
            src={agent.avatar_url}
            alt={agent.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-100 group-hover:ring-primary-300 transition-all"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center transition-colors">
            <Bot className="w-10 h-10 text-primary-600" />
          </div>
        )}
      </div>

      {/* Agent Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {agent.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 text-center line-clamp-2">
        {agent.description}
      </p>

      {/* Tools */}
      <div className="flex flex-wrap gap-1 justify-center mb-4">
        {agent.default_tools.slice(0, 3).map((tool) => (
          <span
            key={tool}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
          >
            {tool}
          </span>
        ))}
      </div>

      {/* Score (if personalized) */}
      {score !== undefined && (
        <div className="flex items-center justify-center gap-1 text-xs text-primary-600">
          <Sparkles className="w-3 h-3" />
          <span className="font-medium">{Math.round(score * 100)}% match</span>
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
          Create & Chat
        </button>
      </div>
    </div>
  );
}
