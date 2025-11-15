import { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp, ThumbsDown, ExternalLink, Search } from 'lucide-react';
import type { Message, AgentInstance } from '../types';

interface ChatViewProps {
  agent: AgentInstance;
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  onFeedback: (messageId: string, label: 'up' | 'down') => void;
  loading?: boolean;
}

export function ChatView({ agent, messages, onSendMessage, onFeedback, loading }: ChatViewProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput('');
    setSending(true);

    try {
      await onSendMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{agent.name}</h2>
            <p className="text-sm text-gray-500">Agent Instance: {agent.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                {/* Metadata */}
                {message.metadata && (
                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                    {/* Search indicator */}
                    {message.metadata.search_query && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Search className="w-3 h-3" />
                        <span>Searched: {message.metadata.search_query}</span>
                      </div>
                    )}

                    {/* Tools used */}
                    {message.metadata.tools_used && message.metadata.tools_used.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {message.metadata.tools_used.map((tool) => (
                          <span
                            key={tool}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Source URLs */}
                    {message.metadata.source_urls && message.metadata.source_urls.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">Sources:</p>
                        {message.metadata.source_urls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate">{url}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback buttons (for assistant messages only) */}
                {message.role === 'assistant' && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => onFeedback(message.id, 'up')}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title="Helpful"
                    >
                      <ThumbsUp className="w-4 h-4 text-gray-600 hover:text-green-600" />
                    </button>
                    <button
                      onClick={() => onFeedback(message.id, 'down')}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-4 h-4 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={sending || loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending || loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-2">
          Powered by <span className="font-semibold">Linkup</span> for real-time search •
          <span className="font-semibold"> FrontMCP</span> for tool integration
        </p>
      </div>
    </div>
  );
}
