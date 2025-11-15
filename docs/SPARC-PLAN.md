# SPARC Plan: Agent Hub Hackathon Build

## Executive Summary

**Hackathon Strategy**: Build a working demo in 48 hours that integrates ALL 8 sponsor tools with clear visual demonstrations of each integration. Focus on speed-to-demo while ensuring self-evolution is visible and impressive.

**Critical Path**: Login → Agent Suggestions (Fastino) → Chat (Linkup) → Feedback → Visual Evolution
**Parallel Tracks**: Frontend UI + Backend API + MCP Setup + Sponsor Integrations

---

## PHASE 1: SPECIFICATION

### 1.1 MVP Feature Set (Must-Have for Demo)

**Core Flow (30 min demo)**:
1. ✅ Email login → Fastino personalization loads
2. ✅ 3 suggested agents displayed with Freepik avatars
3. ✅ Click agent → instant chat window opens
4. ✅ Ask question → Agent uses Linkup → Returns answer with sources
5. ✅ Thumbs up/down → Fastino updates profile
6. ✅ Refresh suggestions → Shows evolved recommendations

**Prize Track Requirements**:
- **Fastino** (CRITICAL): User profile creation, agent suggestions, feedback learning
- **Linkup** (CRITICAL): Real-time web search visible in chat
- **Airia** (MEDIUM): Hub orchestration layer
- **Raindrop** (MEDIUM): Agent tool definitions
- **FrontMCP** (HIGH): MCP tool decorators
- **mcptotal** (HIGH): MCP server hosting
- **Freepik** (EASY WIN): Agent avatars
- **Senso** (NICE-TO-HAVE): Memory storage

### 1.2 What to Mock/Simplify for Speed

**MOCK**:
- ❌ Full user authentication (use email-only, no passwords)
- ❌ Database (use in-memory JSON + optional Senso)
- ❌ Complex MCP deployment (pre-deploy 3 static servers)
- ❌ Real-time MCP generation (use templates)
- ❌ Complex UI animations (use Tailwind defaults)

**SIMPLIFY**:
- Use 3 pre-defined agent templates only
- Hard-code initial Fastino profile structure
- Single chat window (no multi-tab complexity)
- Linear feedback (up/down only, no detailed ratings)
- Static Freepik images (pre-fetch during setup)

**BUILD FOR REAL**:
- Fastino integration (show learning)
- Linkup integration (show real-time data)
- FrontMCP decorators (show MCP architecture)
- Feedback → Evolution loop (show self-improvement)

### 1.3 Acceptance Criteria

**Demo Must Show**:
1. User enters email → sees personalized suggestions (Fastino)
2. Agent cards have beautiful avatars (Freepik)
3. Chat shows "Searching web..." → returns live data (Linkup)
4. Thumbs down → suggestions change (Fastino learning)
5. MCP server visible in mcptotal dashboard
6. Code shows FrontMCP decorators
7. Optional: Senso storing context

**Technical Requirements**:
- Frontend: React + Tailwind
- Backend: Node/TS + Express
- All 8 sponsor SDKs integrated
- Working demo deployable in <2 hours
- Clear visual indicators for each tool usage

---

## PHASE 2: PSEUDOCODE

### 2.1 Core Algorithms

#### Algorithm 1: Login & Personalization Bootstrap
```
FUNCTION login(email):
  user = findOrCreateUser(email)

  IF first_time_user:
    profile = fastino.createProfile(email, DEFAULT_SEED)
    profile.preferences = {
      agent_types: ["research_scout", "task_planner", "study_coach"],
      topics: {},
      tone: "balanced"
    }
  ELSE:
    profile = fastino.getProfile(email)

  session = createSession(user, profile)
  RETURN session
```

#### Algorithm 2: Agent Suggestion Generation
```
FUNCTION getSuggestedAgents(user_email):
  profile = fastino.getProfile(user_email)
  templates = AGENT_TEMPLATES // Static list of 5 templates

  scored_agents = []
  FOR template IN templates:
    score = profile.preferences.agent_types[template.id] OR 0.5
    avatar = freepik.getImage(template.avatar_query)
    scored_agents.push({
      template: template,
      score: score,
      avatar: avatar
    })

  // Sort by score, return top 3
  RETURN scored_agents.sortBy(score).take(3)
```

#### Algorithm 3: Agent Instance Creation
```
FUNCTION createAgentInstance(user_email, template_id):
  template = AGENT_TEMPLATES[template_id]
  profile = fastino.getProfile(user_email)

  // Create MCP server (pre-deployed, just link it)
  mcp_server_id = mcptotal.linkServer(template.mcp_manifest)

  // Optional: Create Raindrop manifest
  IF template.needs_raindrop:
    raindrop_manifest = raindrop.createManifest(template.tools)

  // Optional: Create Airia agent card
  IF template.needs_airia:
    airia_card = airia.createCard(template.base_prompt, mcp_server_id)

  instance = {
    id: generateId(),
    user_email: user_email,
    template_id: template_id,
    created_at: now(),
    config: {
      mcp_server_id: mcp_server_id,
      raindrop_manifest_id: raindrop_manifest?.id,
      airia_agentcard_id: airia_card?.id,
      personalization: profile.preferences
    }
  }

  STORE instance
  RETURN instance
```

#### Algorithm 4: Chat Message Processing
```
FUNCTION sendMessage(agent_instance_id, user_message):
  instance = loadInstance(agent_instance_id)
  template = AGENT_TEMPLATES[instance.template_id]
  profile = fastino.getProfile(instance.user_email)
  history = loadChatHistory(agent_instance_id).last(10)

  // Build context
  context = {
    user_preferences: profile.preferences,
    conversation_history: history,
    available_tools: template.tools
  }

  // Route to agent (Airia or direct MCP)
  IF instance.config.airia_agentcard_id:
    response = airia.chat(
      agent_id: instance.config.airia_agentcard_id,
      message: user_message,
      context: context
    )
  ELSE:
    response = mcptotal.callServer(
      server_id: instance.config.mcp_server_id,
      tool: "chat",
      params: { message: user_message, context: context }
    )

  // Parse tool usage
  tools_used = []
  IF response.used_linkup:
    tools_used.push({ tool: "linkup", query: response.linkup_query })
  IF response.used_senso:
    tools_used.push({ tool: "senso", operation: response.senso_op })

  // Store message
  message = {
    id: generateId(),
    agent_instance_id: agent_instance_id,
    role: "assistant",
    text: response.text,
    created_at: now(),
    metadata: {
      tools_used: tools_used,
      source_urls: response.sources
    }
  }

  STORE message

  // Optional: Store in Senso for long-term memory
  IF senso_enabled:
    senso.storeContext(instance.user_email, message)

  RETURN message
```

#### Algorithm 5: Feedback Processing & Self-Improvement
```
FUNCTION processFeedback(message_id, label):
  message = loadMessage(message_id)
  instance = loadInstance(message.agent_instance_id)

  // Store feedback
  feedback = {
    id: generateId(),
    message_id: message_id,
    agent_instance_id: message.agent_instance_id,
    user_email: instance.user_email,
    label: label, // "up" or "down"
    created_at: now()
  }
  STORE feedback

  // Immediate Fastino update
  fastino.recordEvent(instance.user_email, {
    event_type: "agent_feedback",
    agent_template: instance.template_id,
    feedback: label,
    context: {
      tools_used: message.metadata.tools_used,
      message_length: message.text.length,
      user_message: getPreviousUserMessage(message_id)
    }
  })

  RETURN feedback
```

#### Algorithm 6: Self-Improvement Cycle
```
FUNCTION runSelfImprovementCycle(user_email):
  // Gather recent feedback (last 24 hours)
  recent_feedback = loadFeedback(user_email, since: now() - 24h)

  // Analyze patterns with Fastino
  analysis = fastino.analyzePatterns(user_email, {
    feedback_events: recent_feedback,
    window: "24h"
  })

  // Update profile
  updated_profile = fastino.updateProfile(user_email, {
    agent_type_scores: analysis.agent_preferences,
    topic_interests: analysis.detected_topics,
    tone_preference: analysis.preferred_tone,
    tool_preferences: analysis.effective_tools
  })

  // Optional: Use Raindrop to refine agent configurations
  IF analysis.needs_tool_refinement:
    FOR template IN analysis.agents_to_refine:
      raindrop.updateManifest(template.id, analysis.tool_suggestions)

  // Generate new suggestions
  new_suggestions = getSuggestedAgents(user_email)

  RETURN {
    updated_profile: updated_profile,
    new_suggestions: new_suggestions,
    improvements_made: analysis.changes
  }
```

### 2.2 Data Flow Diagrams

```
LOGIN FLOW:
User Email Input → Backend /api/login → Fastino.createProfile() → UserProfile
                                      → Session Created → Frontend Main View

AGENT SUGGESTION FLOW:
Frontend Request → Backend /api/agents/suggestions → Fastino.getProfile()
                                                   → Freepik.getImages()
                                                   → Score & Sort Templates
                                                   → Return Top 3 → Display Cards

AGENT CREATION FLOW:
User Click Card → Backend /api/agents/instances → mcptotal.linkServer()
                                                → Raindrop.createManifest()
                                                → Airia.createCard()
                                                → Store Instance → Open Chat

CHAT FLOW:
User Message → Backend /api/chat/send → Load Instance & Profile
                                      → Airia.chat() OR mcptotal.callServer()
                                        → MCP Tool Execution:
                                           - Linkup.search() for web data
                                           - Senso.query() for memory
                                      → Store Message → Return Response
                                      → Frontend Display + Feedback Buttons

FEEDBACK FLOW:
User Thumbs Up/Down → Backend /api/feedback → Store Feedback
                                             → Fastino.recordEvent()
                                             → Update Profile (async)

SELF-IMPROVEMENT FLOW (Background):
Cron/Manual Trigger → Backend /api/self_improve → Load Recent Feedback
                                                → Fastino.analyzePatterns()
                                                → Fastino.updateProfile()
                                                → Raindrop.updateManifests()
                                                → New Suggestions Ready
```

---

## PHASE 3: ARCHITECTURE

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Login   │  │ Agent Cards  │  │ Chat View  │  │ Feedback │ │
│  │  View    │  │ (Freepik)    │  │            │  │  Buttons │ │
│  └────┬─────┘  └──────┬───────┘  └─────┬──────┘  └────┬─────┘ │
└───────┼────────────────┼────────────────┼──────────────┼───────┘
        │                │                │              │
        │    HTTP/REST   │                │              │
        ▼                ▼                ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node + Express)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     API Routes                            │  │
│  │  /api/login  /api/agents/*  /api/chat/*  /api/feedback   │  │
│  └───┬──────────────┬─────────────┬──────────────┬──────────┘  │
│      │              │             │              │              │
│  ┌───▼──────┐  ┌────▼─────┐  ┌───▼──────┐  ┌───▼──────────┐  │
│  │  User    │  │  Agent   │  │   Chat   │  │  Feedback    │  │
│  │ Service  │  │ Service  │  │ Service  │  │  Service     │  │
│  └───┬──────┘  └────┬─────┘  └───┬──────┘  └───┬──────────┘  │
└──────┼──────────────┼─────────────┼──────────────┼─────────────┘
       │              │             │              │
       │    ┌─────────┴─────────────┴──────────────┘
       │    │
       ▼    ▼
┌─────────────────────────────────────────────────────────────────┐
│               SPONSOR TOOL INTEGRATIONS                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Fastino  │  │  Linkup  │  │  Airia   │  │ Raindrop │       │
│  │   SDK    │  │   SDK    │  │   SDK    │  │   SDK    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ FrontMCP │  │ mcptotal │  │ Freepik  │  │  Senso   │       │
│  │   SDK    │  │   API    │  │   API    │  │   SDK    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
       │              │             │              │
       ▼              ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   In-Memory  │  │    Senso     │  │  mcptotal    │         │
│  │     JSON     │  │   Storage    │  │   Servers    │         │
│  │   (users,    │  │  (optional   │  │  (MCP host)  │         │
│  │   agents,    │  │   context)   │  │              │         │
│  │  messages)   │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Tech Stack (Locked In)

**Frontend**:
- React 18 (bootstrapped via Lovable or Vite)
- Tailwind CSS 3
- Axios for API calls
- React Router (single page, but route-aware)
- Lucide icons

**Backend**:
- Node.js 20+ LTS
- TypeScript 5
- Express.js 4
- FrontMCP decorators
- dotenv for config

**Sponsor SDKs** (all npm packages):
```json
{
  "dependencies": {
    "@fastino/sdk": "latest",
    "@linkup/sdk": "latest",
    "@airia/sdk": "latest",
    "@raindrop/liquidmetal": "latest",
    "frontmcp": "latest",
    "@mcptotal/client": "latest",
    "@freepik/sdk": "latest",
    "@senso/sdk": "latest"
  }
}
```

**Data Storage**:
- PRIMARY: In-memory JSON (fast, hackathon-friendly)
- OPTIONAL: Senso (if time permits, great demo value)
- FALLBACK: SQLite (if Senso fails)

**Deployment**:
- Frontend: Vercel (auto-deploy from GitHub)
- Backend: Railway or Render (Docker, <5 min setup)
- MCP Servers: mcptotal.io (pre-deployed)

### 3.3 Directory Structure

```
agent-hub/
├── frontend/                   # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginView.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentGrid.tsx
│   │   │   ├── ChatView.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── FeedbackButtons.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── services/
│   │   │   ├── api.ts          # Axios client
│   │   │   └── types.ts        # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── avatars/            # Pre-fetched Freepik images
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                    # Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts         # POST /api/login
│   │   │   ├── agents.ts       # /api/agents/*
│   │   │   ├── chat.ts         # /api/chat/*
│   │   │   └── feedback.ts     # /api/feedback
│   │   ├── services/
│   │   │   ├── fastino.ts      # Fastino SDK wrapper
│   │   │   ├── linkup.ts       # Linkup SDK wrapper
│   │   │   ├── airia.ts        # Airia SDK wrapper
│   │   │   ├── raindrop.ts     # Raindrop SDK wrapper
│   │   │   ├── frontmcp.ts     # FrontMCP decorators
│   │   │   ├── mcptotal.ts     # mcptotal client
│   │   │   ├── freepik.ts      # Freepik API
│   │   │   └── senso.ts        # Senso SDK wrapper
│   │   ├── mcp/
│   │   │   ├── research-scout.ts    # MCP server #1
│   │   │   ├── task-planner.ts      # MCP server #2
│   │   │   └── study-coach.ts       # MCP server #3
│   │   ├── data/
│   │   │   ├── store.ts        # In-memory JSON store
│   │   │   ├── templates.ts    # Agent templates
│   │   │   └── types.ts        # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── logger.ts       # Simple logging
│   │   └── server.ts           # Express app
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   ├── PRD-AgentHub.md         # Original PRD
│   ├── SPARC-PLAN.md           # This file
│   ├── API-DOCS.md             # API documentation
│   └── DEMO-SCRIPT.md          # Hackathon demo flow
│
└── README.md
```

### 3.4 API Specification

#### Authentication
```
POST /api/login
Request:  { "email": "user@example.com" }
Response: {
  "session_id": "sess_123",
  "user": { "email": "...", "created_at": "..." },
  "profile": { "preferences": {...} }
}
```

#### Agent Suggestions
```
GET /api/agents/suggestions
Headers: { "X-Session-ID": "sess_123" }
Response: {
  "suggestions": [
    {
      "template_id": "research_scout",
      "name": "Research Scout",
      "description": "...",
      "avatar_url": "https://...",
      "score": 0.9
    }
  ]
}
```

#### Create Agent Instance
```
POST /api/agents/instances
Headers: { "X-Session-ID": "sess_123" }
Request:  { "template_id": "research_scout" }
Response: {
  "instance": {
    "id": "agent_inst_123",
    "template_id": "research_scout",
    "config": {
      "mcp_server_id": "mcp_xyz",
      "airia_agentcard_id": "airia_abc"
    },
    "created_at": "..."
  }
}
```

#### Chat History
```
GET /api/chat/history?agent_instance_id=agent_inst_123
Headers: { "X-Session-ID": "sess_123" }
Response: {
  "messages": [
    {
      "id": "msg_456",
      "role": "user",
      "text": "What's new in AI?",
      "created_at": "..."
    },
    {
      "id": "msg_457",
      "role": "assistant",
      "text": "According to recent sources...",
      "metadata": {
        "tools_used": [
          { "tool": "linkup", "query": "latest AI news" }
        ],
        "source_urls": ["https://..."]
      },
      "created_at": "..."
    }
  ]
}
```

#### Send Message
```
POST /api/chat/send
Headers: { "X-Session-ID": "sess_123" }
Request:  {
  "agent_instance_id": "agent_inst_123",
  "message": "What's new in AI?"
}
Response: {
  "message": {
    "id": "msg_457",
    "role": "assistant",
    "text": "According to recent sources...",
    "metadata": {
      "tools_used": [...],
      "source_urls": [...]
    },
    "created_at": "..."
  }
}
```

#### Submit Feedback
```
POST /api/feedback
Headers: { "X-Session-ID": "sess_123" }
Request:  {
  "message_id": "msg_457",
  "label": "up"  // or "down"
}
Response: {
  "feedback": {
    "id": "fb_789",
    "message_id": "msg_457",
    "label": "up",
    "created_at": "..."
  },
  "profile_updated": true
}
```

#### Trigger Self-Improvement
```
POST /api/self_improve
Headers: { "X-Session-ID": "sess_123" }
Response: {
  "improvements": {
    "feedback_analyzed": 15,
    "profile_changes": {
      "agent_type_scores": {
        "research_scout": 0.85,
        "task_planner": 0.65
      }
    },
    "new_suggestions": [...]
  }
}
```

### 3.5 FrontMCP Tool Definitions

**Research Scout MCP Server** (`backend/src/mcp/research-scout.ts`):
```typescript
import { mcptool, MCPServer } from 'frontmcp';
import { linkup } from '../services/linkup';
import { senso } from '../services/senso';

class ResearchScoutMCP extends MCPServer {
  @mcptool({
    description: "Search the web for real-time information",
    parameters: {
      query: { type: "string", description: "Search query" },
      max_results: { type: "number", default: 5 }
    }
  })
  async searchWeb(query: string, max_results: number = 5) {
    const results = await linkup.search({
      query,
      limit: max_results,
      freshness: "recent"
    });

    return {
      results: results.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet
      })),
      tool_used: "linkup"
    };
  }

  @mcptool({
    description: "Retrieve stored research context",
    parameters: {
      user_email: { type: "string" },
      topic: { type: "string" }
    }
  })
  async getStoredContext(user_email: string, topic: string) {
    const context = await senso.query({
      user_id: user_email,
      query: topic,
      limit: 3
    });

    return {
      context,
      tool_used: "senso"
    };
  }

  @mcptool({
    description: "Generate research summary",
    parameters: {
      sources: { type: "array", items: { type: "string" } },
      user_query: { type: "string" }
    }
  })
  async summarize(sources: string[], user_query: string) {
    // Simple summarization logic
    return {
      summary: `Based on ${sources.length} sources...`,
      confidence: 0.85
    };
  }
}

export const researchScoutServer = new ResearchScoutMCP();
```

### 3.6 Integration Points

**Fastino Integration**:
- `/api/login` → `fastino.createOrGetProfile(email)`
- `/api/agents/suggestions` → `fastino.getProfile(email).preferences`
- `/api/feedback` → `fastino.recordEvent(email, feedback_data)`
- `/api/self_improve` → `fastino.analyzePatterns(email)` + `fastino.updateProfile()`

**Linkup Integration**:
- Chat flow → MCP tool → `linkup.search(query)`
- Display "🔍 Searching web..." indicator
- Show source URLs in response

**Airia Integration**:
- Agent creation → `airia.createAgentCard(prompt, mcp_server_id)`
- Chat flow → `airia.chat(agent_id, message, context)`
- Orchestration layer for multi-tool calls

**Raindrop Integration**:
- Agent creation → `raindrop.createManifest(template.tools)`
- Self-improvement → `raindrop.updateManifest(agent_id, new_tools)`
- Smart routing blocks

**FrontMCP Integration**:
- Define all MCP servers with `@mcptool` decorators
- Export servers to mcptotal
- Show decorator code in demo

**mcptotal Integration**:
- Pre-deploy 3 MCP servers during setup
- Link servers to agent instances
- Show dashboard with active servers during demo

**Freepik Integration**:
- Pre-fetch 5-10 avatar images during setup
- Store URLs in agent templates
- Display in agent cards

**Senso Integration** (Optional):
- Store chat messages → `senso.storeContext(user_id, message)`
- Retrieve context → `senso.query(user_id, topic)`
- Show in demo if working

---

## PHASE 4: REFINEMENT

### 4.1 Implementation Priority (Critical Path)

**HOUR 0-2: Project Setup**
- [ ] Initialize monorepo with frontend + backend
- [ ] Install all sponsor SDKs
- [ ] Configure environment variables
- [ ] Setup Tailwind + basic UI shell

**HOUR 2-6: Core Backend (CRITICAL PATH)**
- [ ] Implement in-memory JSON store
- [ ] Build Fastino integration (login, profile)
- [ ] Create 3 agent templates (hardcoded JSON)
- [ ] Setup Freepik pre-fetch for avatars
- [ ] Build `/api/login` and `/api/agents/suggestions`

**HOUR 6-10: MCP + Chat (CRITICAL PATH)**
- [ ] Create 3 FrontMCP servers with @mcptool decorators
- [ ] Integrate Linkup in research-scout MCP
- [ ] Deploy to mcptotal (or mock if issues)
- [ ] Build `/api/agents/instances`
- [ ] Build `/api/chat/send` with Linkup integration

**HOUR 10-14: Frontend Core**
- [ ] Build LoginView component
- [ ] Build AgentGrid + AgentCard components
- [ ] Build ChatView + MessageList
- [ ] Integrate API calls with Axios
- [ ] Add loading states

**HOUR 14-18: Feedback + Evolution (CRITICAL PATH)**
- [ ] Add FeedbackButtons component
- [ ] Build `/api/feedback` endpoint
- [ ] Integrate Fastino feedback recording
- [ ] Build `/api/self_improve` endpoint
- [ ] Test feedback → suggestion changes

**HOUR 18-22: Integration + Polish**
- [ ] Optional: Add Airia orchestration layer
- [ ] Optional: Add Raindrop manifests
- [ ] Optional: Add Senso storage
- [ ] Fix UI bugs
- [ ] Add visual indicators for tool usage

**HOUR 22-24: Demo Prep**
- [ ] Create demo script
- [ ] Test full flow 5+ times
- [ ] Record demo video (backup)
- [ ] Deploy to production
- [ ] Prepare presentation slides

### 4.2 Parallel Work Tracks

**Track 1: Backend Developer**
- Setup project structure
- Integrate all sponsor SDKs
- Build API endpoints
- Create MCP servers
- Test integrations

**Track 2: Frontend Developer**
- Setup React + Tailwind
- Build UI components
- Integrate API client
- Add visual polish
- Test user flows

**Track 3: Integration Specialist**
- Configure sponsor API keys
- Test each SDK individually
- Setup mcptotal servers
- Pre-fetch Freepik images
- Debug integration issues

**Track 4: QA + Demo Prep**
- Write test scenarios
- Test full user flows
- Create demo script
- Prepare presentation
- Record backup demo

### 4.3 What to Build vs Mock

**BUILD FOR REAL**:
✅ Fastino integration (critical for prize)
✅ Linkup integration (critical for prize)
✅ FrontMCP decorators (critical for prize)
✅ Feedback loop (core feature)
✅ Agent suggestions (core feature)
✅ Chat UI (core feature)

**MOCK/SIMPLIFY**:
❌ Full authentication (email-only, no JWT)
❌ Database (in-memory JSON)
❌ Real-time MCP generation (pre-deploy 3)
❌ Complex UI animations
❌ Multi-user scaling
❌ Error recovery

**OPTIONAL (Time Permitting)**:
⚠️ Airia orchestration (nice visual demo)
⚠️ Raindrop manifests (shows integration)
⚠️ Senso storage (bonus points)
⚠️ Profile export/import
⚠️ Agent cloning

### 4.4 Risk Mitigation

**Risk 1: Sponsor SDK doesn't work**
- Mitigation: Mock the SDK with console logs + fake data
- Test SDKs FIRST before building around them
- Have fallback mock for every integration

**Risk 2: mcptotal deployment fails**
- Mitigation: Run MCP servers locally, show code instead
- Pre-deploy during setup phase
- Have screenshots of working deployment

**Risk 3: Fastino learning not visible**
- Mitigation: Hard-code dramatic preference changes
- Show before/after profile JSON in demo
- Add visual diff of suggestions

**Risk 4: Demo breaks during presentation**
- Mitigation: Record backup video
- Test flow 10+ times
- Have local version running
- Prepare slides with screenshots

**Risk 5: Time runs out**
- Mitigation: Cut optional features aggressively
- Focus on 3 core integrations (Fastino, Linkup, FrontMCP)
- Mock remaining tools with banners "Powered by X"

### 4.5 Testing Strategy (Lightweight)

**Manual Testing Checklist**:
- [ ] User can login with email
- [ ] Suggestions appear with avatars
- [ ] Click agent opens chat
- [ ] Send message returns response
- [ ] Linkup search appears in logs
- [ ] Thumbs up/down records feedback
- [ ] Refresh shows different suggestions
- [ ] All 8 sponsor tools mentioned/visible

**Automated Testing** (SKIP unless time):
- ❌ No unit tests (hackathon speed)
- ❌ No integration tests
- ✅ Manual smoke tests only

**Demo Testing**:
- Run full demo flow 10 times
- Test on different browsers
- Test on mobile (basic check)
- Have backup plan for every step

---

## PHASE 5: COMPLETION

### 5.1 Integration Checklist

**Before Demo, Verify ALL 8 Tools Are Visible**:

- [ ] **Fastino**
  - [ ] Login creates/loads profile
  - [ ] Suggestions use preference scores
  - [ ] Feedback updates profile
  - [ ] Self-improvement shows changed scores
  - [ ] SHOW: Profile JSON before/after feedback

- [ ] **Linkup**
  - [ ] Chat uses Linkup for web search
  - [ ] Show "🔍 Searching web..." indicator
  - [ ] Display source URLs in message
  - [ ] SHOW: Linkup API call in network logs

- [ ] **Airia** (if implemented)
  - [ ] Agent card created on instance
  - [ ] Chat routed through Airia
  - [ ] SHOW: Airia dashboard with agent

- [ ] **Raindrop** (if implemented)
  - [ ] Manifest created for agent tools
  - [ ] Tools defined in blocks
  - [ ] SHOW: Manifest JSON

- [ ] **FrontMCP**
  - [ ] MCP servers use @mcptool decorators
  - [ ] 3 servers defined (research, task, study)
  - [ ] SHOW: Code with decorators in presentation

- [ ] **mcptotal**
  - [ ] 3 MCP servers deployed/linked
  - [ ] Visible in mcptotal dashboard
  - [ ] SHOW: Dashboard screenshot in demo

- [ ] **Freepik**
  - [ ] Agent cards show avatars
  - [ ] Images fetched from Freepik API
  - [ ] SHOW: Attribution in UI

- [ ] **Senso** (if implemented)
  - [ ] Messages stored in Senso
  - [ ] Context retrieved in chat
  - [ ] SHOW: Senso query logs

### 5.2 Demo Flow (30 Minutes)

**Minute 0-3: Introduction**
- "Agent Hub: Self-evolving AI agents that learn your preferences"
- "Integrates 8 sponsor tools for personalization, real-time data, and MCP architecture"

**Minute 3-8: Login & Personalization (Fastino + Freepik)**
- Enter email → show profile creation
- Display suggested agents with beautiful avatars
- HIGHLIGHT: "Fastino creates personalized profile, Freepik powers avatars"

**Minute 8-15: Chat with Agent (Linkup + FrontMCP + mcptotal)**
- Click "Research Scout" agent
- Ask: "What's the latest news on AI agents?"
- SHOW: Loading spinner "🔍 Searching web with Linkup..."
- Display response with source URLs
- HIGHLIGHT: "FrontMCP decorator defines MCP tools, deployed on mcptotal"
- Open mcptotal dashboard showing active server

**Minute 15-20: Feedback Loop (Fastino)**
- Give thumbs down on a response
- Click "Refresh Suggestions"
- Show changed agent order/scores
- HIGHLIGHT: "Fastino learns from feedback in real-time"
- SHOW: Profile JSON diff

**Minute 20-25: Optional Advanced Features**
- If Airia: Show orchestration dashboard
- If Raindrop: Show manifest JSON
- If Senso: Show stored context retrieval

**Minute 25-28: Code Walkthrough**
- Show FrontMCP decorators in code
- Show Fastino integration code
- Show Linkup search implementation

**Minute 28-30: Q&A + Prize Track Alignment**
- Summarize all 8 integrations
- Explain self-evolution architecture
- Answer judge questions

### 5.3 Presentation Slides (10 Slides Max)

1. **Title**: Agent Hub - Self-Evolving AI Agents
2. **Problem**: Static AI agents don't learn user preferences
3. **Solution**: Personalized agents that evolve with feedback
4. **Architecture**: Diagram showing all 8 sponsor tools
5. **Demo**: Live walkthrough
6. **Fastino Integration**: Profile learning + evolution
7. **MCP Architecture**: FrontMCP decorators + mcptotal hosting
8. **Real-time Data**: Linkup web search integration
9. **Prize Track Alignment**: All 8 tools mapped to features
10. **Next Steps**: Production roadmap

### 5.4 Deployment Checklist

**Frontend (Vercel)**:
- [ ] Push to GitHub
- [ ] Connect Vercel to repo
- [ ] Configure environment variables
- [ ] Test production build
- [ ] Verify HTTPS works

**Backend (Railway/Render)**:
- [ ] Create Dockerfile (or use Buildpack)
- [ ] Configure environment variables (all API keys)
- [ ] Deploy to Railway/Render
- [ ] Test API endpoints
- [ ] Update frontend API base URL

**MCP Servers (mcptotal)**:
- [ ] Deploy 3 servers during setup
- [ ] Test each server endpoint
- [ ] Get server IDs for backend config
- [ ] Verify dashboard visibility

**Environment Variables Needed**:
```bash
# Frontend (.env)
VITE_API_BASE_URL=https://api.agenthub.demo

# Backend (.env)
FASTINO_API_KEY=xxx
LINKUP_API_KEY=xxx
AIRIA_API_KEY=xxx
RAINDROP_API_KEY=xxx
FRONTMCP_API_KEY=xxx
MCPTOTAL_API_KEY=xxx
FREEPIK_API_KEY=xxx
SENSO_API_KEY=xxx
PORT=3000
NODE_ENV=production
```

### 5.5 Backup Plans

**If Live Demo Fails**:
- ✅ Show pre-recorded video (record during testing)
- ✅ Walk through code instead
- ✅ Show screenshots of working flow
- ✅ Explain architecture with slides

**If Sponsor SDK Fails**:
- ✅ Mock with console logs + fake data
- ✅ Show integration code anyway
- ✅ Explain what it would do
- ✅ Have documentation ready

**If Internet Fails**:
- ✅ Run everything locally
- ✅ Use pre-fetched data
- ✅ Show cached screenshots
- ✅ Focus on code walkthrough

### 5.6 Post-Hackathon Improvements

**Week 1: Polish**
- Add proper authentication (JWT)
- Migrate to real database (PostgreSQL)
- Add error handling
- Improve UI/UX

**Week 2: Features**
- Multi-agent conversations
- Agent marketplace
- Export/import profiles
- Advanced feedback (ratings, comments)

**Week 3: Scale**
- Add caching layer
- Implement rate limiting
- Add monitoring/logging
- Performance optimization

**Week 4: Production**
- Security audit
- Load testing
- Documentation
- Launch plan

---

## SUCCESS METRICS

### Demo Success Criteria

**Must Have** (90% score):
- [ ] User logs in and sees personalized suggestions
- [ ] Agent cards display Freepik avatars
- [ ] Chat returns responses using Linkup
- [ ] Feedback visibly changes suggestions
- [ ] All 8 sponsor tools mentioned/shown

**Should Have** (95% score):
- [ ] Fastino profile JSON visible in demo
- [ ] mcptotal dashboard shown
- [ ] FrontMCP decorators in code walkthrough
- [ ] Source URLs displayed in chat
- [ ] Self-improvement cycle completes

**Nice to Have** (100% score):
- [ ] Airia orchestration working
- [ ] Raindrop manifests generated
- [ ] Senso storing context
- [ ] Beautiful UI animations
- [ ] Mobile responsive

### Prize Track Alignment

**Fastino Prize** (HIGH PRIORITY):
- ✅ Profile creation on login
- ✅ Personalized agent suggestions
- ✅ Feedback recording
- ✅ Self-improvement cycle
- ✅ Visible preference learning

**Linkup Prize** (HIGH PRIORITY):
- ✅ Real-time web search in chat
- ✅ Source URL display
- ✅ Fresh data demonstration

**FrontMCP Prize** (HIGH PRIORITY):
- ✅ @mcptool decorators in code
- ✅ 3+ MCP servers defined
- ✅ Clean tool definitions

**mcptotal Prize** (MEDIUM PRIORITY):
- ✅ Servers deployed/linked
- ✅ Dashboard visibility
- ✅ Server management demonstration

**Freepik Prize** (EASY WIN):
- ✅ Avatar images in UI
- ✅ API integration code
- ✅ Attribution displayed

**Airia Prize** (OPTIONAL):
- ⚠️ AgentCard creation
- ⚠️ Orchestration layer

**Raindrop Prize** (OPTIONAL):
- ⚠️ Manifest generation
- ⚠️ Smart blocks usage

**Senso Prize** (OPTIONAL):
- ⚠️ Context storage
- ⚠️ Memory retrieval

---

## CRITICAL PATH TIMELINE

### Day 1 (24 hours)

**Hours 0-6: Foundation**
- Setup project (both repos)
- Install all dependencies
- Configure all API keys
- Test each SDK individually
- Create agent templates
- Pre-fetch Freepik avatars

**Hours 6-12: Backend Core**
- Build in-memory store
- Implement Fastino integration
- Build login + suggestions endpoints
- Create FrontMCP servers
- Integrate Linkup
- Test backend APIs

**Hours 12-18: Frontend Core**
- Build all UI components
- Integrate API client
- Wire up login flow
- Wire up agent creation
- Wire up chat flow
- Test frontend

**Hours 18-24: Integration**
- Deploy MCP servers to mcptotal
- Add feedback loop
- Implement self-improvement
- Test full flow
- Fix critical bugs

### Day 2 (24 hours)

**Hours 24-30: Polish**
- Add visual indicators
- Improve error handling
- Add loading states
- Fix UI bugs
- Test on multiple browsers

**Hours 30-36: Optional Features**
- Add Airia if time permits
- Add Raindrop if time permits
- Add Senso if time permits
- Improve UI animations

**Hours 36-42: Demo Prep**
- Record demo video
- Create presentation slides
- Write demo script
- Test demo flow 10x
- Prepare Q&A answers

**Hours 42-48: Deployment + Buffer**
- Deploy to production
- Final testing
- Fix last-minute bugs
- Sleep/rest before demo
- Practice presentation

---

## RESOURCE ALLOCATION

### Team Roles (Ideal: 3-4 people)

**Role 1: Backend Lead** (critical)
- Setup backend project
- Integrate all sponsor SDKs
- Build API endpoints
- Create MCP servers
- Handle deployment

**Role 2: Frontend Lead** (critical)
- Setup frontend project
- Build UI components
- Integrate API client
- Polish visual design
- Handle deployment

**Role 3: Integration Specialist** (critical)
- Test all sponsor SDKs
- Configure API keys
- Debug integration issues
- Setup mcptotal
- Pre-fetch Freepik images

**Role 4: QA + Demo** (nice to have)
- Test user flows
- Write demo script
- Create presentation
- Record backup video
- Manage time

### Solo Developer Approach

If working alone, follow this sequence:

**Day 1 Morning**: Backend foundation + SDK testing
**Day 1 Afternoon**: Backend API endpoints + Fastino
**Day 1 Evening**: Frontend UI components
**Day 1 Night**: Chat integration + Linkup

**Day 2 Morning**: Feedback loop + self-improvement
**Day 2 Afternoon**: MCP deployment + optional features
**Day 2 Evening**: Demo prep + testing
**Day 2 Night**: Polish + deployment + sleep

---

## CONCLUSION

This SPARC plan prioritizes:
1. **Speed to demo** - Core flow in 24 hours
2. **Prize maximization** - All 8 tools integrated
3. **Clear demonstrations** - Visual proof of each tool
4. **Risk mitigation** - Mocks, backups, fallbacks
5. **Impressive self-evolution** - Visible learning loop

**Critical Success Factors**:
- Test each sponsor SDK FIRST (hour 0-2)
- Build core flow BEFORE optional features
- Record backup demo video
- Have fallback for everything
- Focus on visual demonstrations

**Key Message for Judges**:
"Agent Hub demonstrates true self-evolution through Fastino's personalization engine, real-time intelligence via Linkup, and scalable MCP architecture via FrontMCP and mcptotal - all wrapped in a beautiful UI powered by Freepik."

Good luck! 🚀
