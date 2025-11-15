# Agent Hub API Documentation

## Base URL

```
Production: https://api.agenthub.demo
Development: http://localhost:3000
```

## Authentication

All endpoints (except `/api/login`) require a session ID in headers:

```
X-Session-ID: sess_abc123
```

---

## Endpoints

### 1. Authentication

#### POST `/api/login`

Create or retrieve user session with Fastino personalization.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "session_id": "sess_abc123",
  "user": {
    "email": "user@example.com",
    "created_at": "2025-11-15T10:00:00Z",
    "display_name": null
  },
  "profile": {
    "user_email": "user@example.com",
    "updated_at": "2025-11-15T10:00:00Z",
    "preferences": {
      "agent_types": {
        "research_scout": 0.8,
        "task_planner": 0.6,
        "study_coach": 0.5
      },
      "topics": {},
      "tone": "balanced"
    }
  },
  "is_new_user": true
}
```

**Errors:**
- `400 Bad Request`: Invalid email format
- `500 Internal Server Error`: Fastino API failure

**Implementation Notes:**
- Calls `fastino.createOrGetProfile(email)` on first login
- Creates session with 24-hour expiry
- Stores session in memory (production: Redis)

---

### 2. Agent Suggestions

#### GET `/api/agents/suggestions`

Get personalized agent suggestions based on Fastino profile.

**Headers:**
```
X-Session-ID: sess_abc123
```

**Query Params:**
- `limit` (optional, default: 3): Number of suggestions to return
- `refresh` (optional, boolean): Force re-scoring from Fastino

**Response (200):**
```json
{
  "suggestions": [
    {
      "template_id": "research_scout",
      "name": "Research Scout",
      "description": "Monitors topics and fetches live info from the web using Linkup.",
      "avatar_url": "https://cdn.freepik.com/avatar-robot-scout.png",
      "score": 0.9,
      "default_tools": ["linkup", "senso"],
      "capabilities": [
        "Real-time web search",
        "Topic monitoring",
        "Source verification"
      ]
    },
    {
      "template_id": "task_planner",
      "name": "Task Planner",
      "description": "Helps you organize tasks and manage your schedule.",
      "avatar_url": "https://cdn.freepik.com/avatar-robot-planner.png",
      "score": 0.7,
      "default_tools": ["senso"],
      "capabilities": [
        "Task breakdown",
        "Priority scoring",
        "Schedule optimization"
      ]
    },
    {
      "template_id": "study_coach",
      "name": "Study Coach",
      "description": "Personalized learning assistant with adaptive teaching.",
      "avatar_url": "https://cdn.freepik.com/avatar-robot-teacher.png",
      "score": 0.6,
      "default_tools": ["linkup", "senso"],
      "capabilities": [
        "Concept explanation",
        "Practice problems",
        "Progress tracking"
      ]
    }
  ],
  "profile_updated_at": "2025-11-15T10:00:00Z"
}
```

**Errors:**
- `401 Unauthorized`: Invalid or expired session
- `500 Internal Server Error`: Fastino API failure

**Implementation Notes:**
- Loads `UserProfile` from Fastino
- Scores all available `AgentTemplates` using profile preferences
- Fetches Freepik avatars (cached for 24 hours)
- Sorts by score descending

---

### 3. Agent Instances

#### POST `/api/agents/instances`

Create a new agent instance from a template.

**Headers:**
```
X-Session-ID: sess_abc123
```

**Request:**
```json
{
  "template_id": "research_scout",
  "custom_name": "My Research Bot" // optional
}
```

**Response (201):**
```json
{
  "instance": {
    "id": "agent_inst_abc123",
    "user_email": "user@example.com",
    "template_id": "research_scout",
    "name": "My Research Bot",
    "created_at": "2025-11-15T10:05:00Z",
    "config": {
      "mcp_server_id": "mcp_xyz789",
      "airia_agentcard_id": "airia_def456",
      "raindrop_manifest_id": "raindrop_ghi789",
      "personalization": {
        "tone": "balanced",
        "topics": []
      }
    },
    "status": "active"
  },
  "welcome_message": {
    "id": "msg_welcome_001",
    "role": "assistant",
    "text": "Hi! I'm your Research Scout. I can search the web for real-time information. What would you like to know?",
    "created_at": "2025-11-15T10:05:01Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid template_id
- `401 Unauthorized`: Invalid session
- `500 Internal Server Error`: MCP/Airia/Raindrop deployment failure

**Implementation Notes:**
- Links existing MCP server from mcptotal (pre-deployed)
- Creates Airia AgentCard if template requires it
- Generates Raindrop manifest for tool configuration
- Applies user's Fastino preferences to agent config
- Creates welcome message automatically

---

#### GET `/api/agents/instances`

List all agent instances for the current user.

**Headers:**
```
X-Session-ID: sess_abc123
```

**Query Params:**
- `status` (optional): Filter by status (active, archived)

**Response (200):**
```json
{
  "instances": [
    {
      "id": "agent_inst_abc123",
      "template_id": "research_scout",
      "name": "My Research Bot",
      "created_at": "2025-11-15T10:05:00Z",
      "last_message_at": "2025-11-15T10:15:00Z",
      "message_count": 5,
      "status": "active"
    }
  ],
  "total": 1
}
```

---

#### DELETE `/api/agents/instances/:id`

Archive an agent instance.

**Headers:**
```
X-Session-ID: sess_abc123
```

**Response (200):**
```json
{
  "success": true,
  "instance_id": "agent_inst_abc123"
}
```

**Implementation Notes:**
- Soft delete (sets status to "archived")
- Does not delete MCP server (may be reused)

---

### 4. Chat

#### GET `/api/chat/history`

Get chat history for an agent instance.

**Headers:**
```
X-Session-ID: sess_abc123
```

**Query Params:**
- `agent_instance_id` (required): Agent instance ID
- `limit` (optional, default: 50): Number of messages
- `before` (optional): Message ID for pagination

**Response (200):**
```json
{
  "messages": [
    {
      "id": "msg_001",
      "agent_instance_id": "agent_inst_abc123",
      "role": "user",
      "text": "What's new in AI agents?",
      "created_at": "2025-11-15T10:10:00Z",
      "metadata": {}
    },
    {
      "id": "msg_002",
      "agent_instance_id": "agent_inst_abc123",
      "role": "assistant",
      "text": "Based on recent sources, here are the latest developments...",
      "created_at": "2025-11-15T10:10:05Z",
      "metadata": {
        "tools_used": [
          {
            "tool": "linkup",
            "query": "latest AI agents news",
            "results_count": 5,
            "execution_time_ms": 1250
          }
        ],
        "source_urls": [
          "https://techcrunch.com/2025/11/ai-agents",
          "https://arxiv.org/abs/2025.xxxxx"
        ],
        "confidence": 0.92
      },
      "feedback": {
        "label": "up",
        "submitted_at": "2025-11-15T10:10:30Z"
      }
    }
  ],
  "has_more": false
}
```

**Errors:**
- `400 Bad Request`: Missing agent_instance_id
- `401 Unauthorized`: Invalid session
- `403 Forbidden`: Agent instance belongs to different user
- `404 Not Found`: Agent instance not found

---

#### POST `/api/chat/send`

Send a message to an agent and get a response.

**Headers:**
```
X-Session-ID: sess_abc123
```

**Request:**
```json
{
  "agent_instance_id": "agent_inst_abc123",
  "message": "What's new in AI agents?"
}
```

**Response (200):**
```json
{
  "user_message": {
    "id": "msg_003",
    "role": "user",
    "text": "What's new in AI agents?",
    "created_at": "2025-11-15T10:20:00Z"
  },
  "assistant_message": {
    "id": "msg_004",
    "role": "assistant",
    "text": "Based on recent sources, here are the latest developments in AI agents:\n\n1. Multi-agent collaboration frameworks...\n2. Autonomous decision-making improvements...\n3. Integration with knowledge graphs...",
    "created_at": "2025-11-15T10:20:03Z",
    "metadata": {
      "tools_used": [
        {
          "tool": "linkup",
          "query": "latest AI agents news 2025",
          "results_count": 5,
          "execution_time_ms": 1180
        }
      ],
      "source_urls": [
        "https://techcrunch.com/2025/11/ai-agents-update",
        "https://www.theverge.com/ai-agents-collaboration"
      ],
      "reasoning": "Used Linkup to search for recent AI agent developments. Filtered for articles from past 7 days.",
      "confidence": 0.88
    }
  },
  "processing_time_ms": 3200
}
```

**Errors:**
- `400 Bad Request`: Empty message or invalid agent_instance_id
- `401 Unauthorized`: Invalid session
- `403 Forbidden`: Agent instance belongs to different user
- `500 Internal Server Error`: MCP/Airia call failure
- `503 Service Unavailable`: Linkup/Senso API timeout

**Implementation Notes:**
- Loads last 10 messages as context
- Calls Airia agent (which calls MCP tools) OR calls mcptotal directly
- MCP server may invoke:
  - `linkup.search()` for web data
  - `senso.query()` for stored context
  - `senso.store()` to save conversation
- Stores both messages in database
- Returns within 5 seconds or times out

---

### 5. Feedback

#### POST `/api/feedback`

Submit feedback on an assistant message.

**Headers:**
```
X-Session-ID: sess_abc123
```

**Request:**
```json
{
  "message_id": "msg_004",
  "label": "up" // or "down"
}
```

**Response (200):**
```json
{
  "feedback": {
    "id": "fb_001",
    "message_id": "msg_004",
    "agent_instance_id": "agent_inst_abc123",
    "label": "up",
    "created_at": "2025-11-15T10:21:00Z"
  },
  "profile_updated": true,
  "new_preferences": {
    "agent_types": {
      "research_scout": 0.85,  // Increased due to positive feedback
      "task_planner": 0.6,
      "study_coach": 0.5
    },
    "topics": {
      "ai_agents": 0.9  // New topic detected
    },
    "tone": "balanced"
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid label or message_id
- `401 Unauthorized`: Invalid session
- `404 Not Found`: Message not found
- `409 Conflict`: Feedback already submitted for this message

**Implementation Notes:**
- Stores feedback in database
- Immediately calls `fastino.recordEvent()` with:
  - Event type: "agent_feedback"
  - Agent template used
  - Feedback label
  - Message context (tools used, length, etc.)
  - Previous user message
- Fastino updates profile asynchronously
- Returns updated preferences from Fastino

---

### 6. Self-Improvement

#### POST `/api/self_improve`

Trigger manual self-improvement cycle (normally runs automatically).

**Headers:**
```
X-Session-ID: sess_abc123
```

**Request (optional body):**
```json
{
  "window": "24h" // or "7d", "30d"
}
```

**Response (200):**
```json
{
  "analysis": {
    "feedback_analyzed": 15,
    "timeframe": "24h",
    "patterns_detected": [
      {
        "pattern": "prefers_technical_tone",
        "confidence": 0.89,
        "evidence": "8/10 positive feedback on technical responses"
      },
      {
        "pattern": "interested_in_ai_agents",
        "confidence": 0.95,
        "evidence": "12/15 queries about AI agents"
      },
      {
        "pattern": "dislikes_long_responses",
        "confidence": 0.72,
        "evidence": "3/5 negative feedback on responses >500 words"
      }
    ]
  },
  "profile_changes": {
    "agent_types": {
      "research_scout": {
        "old": 0.85,
        "new": 0.92,
        "reason": "High success rate with research queries"
      },
      "study_coach": {
        "old": 0.5,
        "new": 0.65,
        "reason": "User asked several learning-oriented questions"
      }
    },
    "topics": {
      "ai_agents": 0.95,
      "machine_learning": 0.78
    },
    "tone": {
      "old": "balanced",
      "new": "technical",
      "reason": "Positive feedback on technical explanations"
    }
  },
  "new_suggestions": [
    {
      "template_id": "research_scout",
      "score": 0.92
    },
    {
      "template_id": "ml_specialist",
      "score": 0.78,
      "is_new": true
    },
    {
      "template_id": "study_coach",
      "score": 0.65
    }
  ],
  "improvements_applied": true,
  "next_scheduled_improvement": "2025-11-16T10:00:00Z"
}
```

**Errors:**
- `401 Unauthorized`: Invalid session
- `500 Internal Server Error`: Fastino analysis failure

**Implementation Notes:**
- Loads all feedback from specified time window
- Calls `fastino.analyzePatterns()` to detect learning opportunities
- Calls `fastino.updateProfile()` to apply changes
- Optionally calls `raindrop.updateManifests()` if tool refinement needed
- Triggers re-scoring of agent suggestions
- Normally runs automatically every 6 hours per user

---

### 7. User Profile

#### GET `/api/profile`

Get current Fastino profile for logged-in user.

**Headers:**
```
X-Session-ID: sess_abc123
```

**Response (200):**
```json
{
  "profile": {
    "user_email": "user@example.com",
    "created_at": "2025-11-15T10:00:00Z",
    "updated_at": "2025-11-15T10:21:00Z",
    "preferences": {
      "agent_types": {
        "research_scout": 0.92,
        "task_planner": 0.6,
        "study_coach": 0.65,
        "ml_specialist": 0.78
      },
      "topics": {
        "ai_agents": 0.95,
        "machine_learning": 0.78,
        "productivity": 0.45
      },
      "tone": "technical",
      "response_length": "concise",
      "source_preference": "academic"
    },
    "usage_stats": {
      "total_messages": 42,
      "agents_created": 3,
      "feedback_submitted": 15,
      "positive_feedback_rate": 0.73
    },
    "learning_history": [
      {
        "date": "2025-11-15",
        "changes": ["tone: balanced → technical"],
        "trigger": "self_improvement_cycle"
      }
    ]
  }
}
```

---

## Webhooks (Future)

### POST `/api/webhooks/fastino`

Receive real-time updates from Fastino when profile changes.

**Headers:**
```
X-Fastino-Signature: sha256_signature
```

**Request:**
```json
{
  "event": "profile_updated",
  "user_email": "user@example.com",
  "changes": {
    "agent_types": {
      "research_scout": 0.92
    }
  },
  "timestamp": "2025-11-15T10:21:00Z"
}
```

---

## Rate Limits

- **Free tier**: 100 requests/hour per session
- **Paid tier**: 1000 requests/hour per session
- **Chat endpoint**: Max 20 messages/minute to prevent spam

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1699876543
```

---

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "INVALID_SESSION",
    "message": "Session has expired or is invalid",
    "details": {
      "session_id": "sess_abc123",
      "expired_at": "2025-11-14T10:00:00Z"
    }
  }
}
```

**Common Error Codes:**
- `INVALID_SESSION`: Session expired or not found
- `INVALID_REQUEST`: Missing or malformed parameters
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: User doesn't own this resource
- `RATE_LIMITED`: Too many requests
- `EXTERNAL_API_FAILURE`: Sponsor tool API failed
- `INTERNAL_ERROR`: Server error

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.agenthub.demo',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const { data: loginResponse } = await client.post('/api/login', {
  email: 'user@example.com'
});

const sessionId = loginResponse.session_id;

// Set session for future requests
client.defaults.headers['X-Session-ID'] = sessionId;

// Get suggestions
const { data: suggestions } = await client.get('/api/agents/suggestions');

// Create agent
const { data: instance } = await client.post('/api/agents/instances', {
  template_id: suggestions.suggestions[0].template_id
});

// Send message
const { data: chatResponse } = await client.post('/api/chat/send', {
  agent_instance_id: instance.instance.id,
  message: 'What is new in AI?'
});

// Submit feedback
await client.post('/api/feedback', {
  message_id: chatResponse.assistant_message.id,
  label: 'up'
});
```

---

## Testing

### Postman Collection

Import this collection for quick testing:

```json
{
  "info": {
    "name": "Agent Hub API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"test@example.com\"}"
        }
      }
    }
  ]
}
```

### cURL Examples

```bash
# Login
curl -X POST https://api.agenthub.demo/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Get suggestions
curl -X GET https://api.agenthub.demo/api/agents/suggestions \
  -H "X-Session-ID: sess_abc123"

# Send chat message
curl -X POST https://api.agenthub.demo/api/chat/send \
  -H "X-Session-ID: sess_abc123" \
  -H "Content-Type: application/json" \
  -d '{"agent_instance_id": "agent_inst_abc123", "message": "Hello!"}'
```

---

## Changelog

### v1.0.0 (2025-11-15)
- Initial API release
- Fastino integration
- Linkup integration
- FrontMCP + mcptotal architecture
- Freepik avatars
- Basic self-improvement cycle

### v1.1.0 (Planned)
- Airia orchestration
- Raindrop manifests
- Senso storage
- Webhook support
- Advanced analytics
