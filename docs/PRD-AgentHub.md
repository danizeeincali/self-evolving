# Agent Hub — Hackathon Build Plan

A self-evolving agent launcher: users log in with email, get Fastino-personalized agent suggestions, spin up MCP micro-agents, and chat with them. Agents use real-time data, stored memory, and feedback to improve over time.

You'll implement this primarily in Claude Code and Lovable, integrating sponsored tools where they make sense (and where prizes exist).

---

## 0. High-Level Concept

### User story
1. I log in with my email.
2. The system uses Fastino to create or load my personalization profile.
3. I see a row of Suggested Agents (e.g. Research Scout, Task Planner, Study Coach) with nice visual cards (Freepik avatars).
4. I click one; the system:
   - Instantiates a personal micro-agent for me.
   - Optionally spins up an MCP server (via FrontMCP + Raindrop) and registers it with mcptotal.
5. I chat with that agent in a dedicated thread.
   - Agent uses Linkup for real-time web data.
   - Agent uses Senso for stored context/logs (optional but nice).
6. I give thumbs up/down on responses.
7. A Critic / Self-Improver process uses Fastino + Raindrop to update my preferences and the agent's behavior.
8. Next time I log in, suggested agents and their behavior are more "me."

---

## 1. Tools & How You'll Use Them (for prize tracks)

- **Fastino**
  - Keyed by email.
  - Bootstrap user preferences and suggest agent types.
  - Learn from feedback + history; update user profile.

- **Linkup**
  - Real-time web/news/API search for Research-type agents.
  - Visible in logs / debug to show judges.

- **Airia**
  - Host the main "Hub Agent" that:
    - handles conversation,
    - decides which micro-agent/tool to call,
    - orchestrates calls to MCP servers.

- **Raindrop (LiquidMetal)**
  - Define smart "blocks" for:
    - agent tools (search, memory),
    - scoring / routing,
    - self-improvement.
  - Optionally generate MCP servers (Raindrop + FrontMCP).

- **FrontMCP**
  - TS decorators to define the MCP tools for each micro-agent.
  - E.g. @mcptool functions: searchWeb, querySenso, createTodo.
  - Export as MCP server.

- **mcptotal.io**
  - Host/manage MCP servers for your micro-agents.
  - Show "Agent X" and "Agent Y" as individual MCP servers in your demo.

- **Freepik API**
  - Fetch images/icons to build agent avatar cards.
  - Simple/low effort, high visual payoff.

- **Senso (optional but strong)**
  - Store user profiles, agent configs, chat history, feedback as context.
  - Use for long-term memory & context windows.

---

## 2. Architecture Overview

### 2.1 Frontend (Single-Page UI)

Built in your framework of choice (React or similar; can be bootstrapped via Lovable).

**Layout:**

1. **Login View**
   - Simple "enter email" form.

2. **Main App View**
   - Top: "Suggested Agents" horizontal strip of cards (avatar, name, description, "Create & Chat" button).
   - Left (or top tabs): List of created agent instances.
   - Main pane: Chat window for selected agent.
   - Bottom: Chat input bar + send.
   - Each assistant message has 👍 / 👎 buttons.

### 2.2 Backend

Implement backend in Claude Code (Node/TS recommended) with endpoints:

- `POST /api/login` — create session with email.
- `GET /api/agents/suggestions` — returns suggested agent templates for this user.
- `POST /api/agents/instances` — creates a new agent instance from a template.
- `GET /api/chat/history?agent_instance_id=...` — loads chat history.
- `POST /api/chat/send` — sends a message to agent, returns reply.
- `POST /api/feedback` — stores thumbs up/down.
- `POST /api/self_improve` — triggers critic/self-improvement cycle.

You can host this simple backend anywhere; integration with Raindrop/mcptotal happens via HTTP or MCP.

---

## 3. Data Model (Minimal)

Keep this thin; you can store in DB and/or in Senso.

### 3.1 User

```typescript
User {
  "email": "user@example.com",
  "created_at": "...",
  "display_name": "optional",
  "profile_last_updated": "..."
}
```

### 3.2 AgentTemplate (static JSON or DB table)

```typescript
AgentTemplate {
  "id": "research_scout",
  "name": "Research Scout",
  "description": "Monitors topics & fetches live info from the web.",
  "default_tools": ["linkup", "senso"],
  "base_prompt": "You are a research assistant that..."
}
```

### 3.3 AgentInstance

```typescript
AgentInstance {
  "id": "agent_inst_123",
  "user_email": "user@example.com",
  "template_id": "research_scout",
  "created_at": "...",
  "config": {
    "airia_agentcard_id": "optional",
    "mcp_server_id": "optional",    // mcptotal server ID
    "raindrop_manifest_id": "optional",
    "extra_prefs": {}               // Fastino personalization fields
  }
}
```

### 3.4 Message

```typescript
Message {
  "id": "msg_456",
  "agent_instance_id": "agent_inst_123",
  "user_email": "user@example.com",
  "role": "user" | "assistant",
  "text": "content",
  "created_at": "...",
  "metadata": {
    "tools_used": ["linkup"],
    "source_urls": ["https://..."]
  }
}
```

### 3.5 Feedback

```typescript
Feedback {
  "id": "fb_789",
  "message_id": "msg_456",
  "agent_instance_id": "agent_inst_123",
  "user_email": "user@example.com",
  "label": "up" | "down",
  "created_at": "..."
}
```

### 3.6 UserProfile (Fastino-derived)

```typescript
UserProfile {
  "user_email": "user@example.com",
  "updated_at": "...",
  "preferences": {
    "preferred_agent_templates": [
      { "id": "research_scout", "score": 0.9 },
      { "id": "task_planner",   "score": 0.6 }
    ],
    "topics": {
      "ai": 0.8,
      "productivity": 0.7
    },
    "tone": "concise"
  }
}
```

---

## 4. Core User Flows (Step-by-Step)

### Flow 1 — Login & Fastino Bootstrap

1. User enters email.
2. Backend:
   - Creates/fetches User.
   - Calls Fastino personalization endpoint with email (and possibly a default seed event).
   - Receives or initializes UserProfile.
   - Stores profile in DB/Senso.
3. Frontend redirects to main app.

### Flow 2 — Get Suggested Agents

1. Frontend calls `GET /api/agents/suggestions`.
2. Backend:
   - Loads UserProfile.
   - Maps preferred_agent_templates to AgentTemplate config.
   - If no profile exists yet, calls Fastino for basic suggestions.
3. Returns list of agent templates with:
   - template_id, name, description.
   - Pre-fetched Freepik avatar URL.

### Flow 3 — Create Agent Instance

1. User clicks an agent card.
2. Frontend calls `POST /api/agents/instances` with template_id.
3. Backend:
   - Creates AgentInstance record.
   - Optionally:
     - Builds a Raindrop manifest for this agent's tools.
     - Uses FrontMCP to define tool functions (TS decorators).
     - Deploys to mcptotal as an MCP server.
     - Stores any IDs in config.
   - Optionally creates Airia AgentCard pointing to this MCP server.
4. Returns agent_instance_id + basic info.
5. Frontend opens a chat tab for that instance and shows welcome message.

### Flow 4 — Chat with Agent

1. User types message -> `POST /api/chat/send`.
2. Backend:
   - Loads AgentInstance, UserProfile, last N messages.
   - Builds a call to:
     - Airia agent (which in turn calls MCP tools), or
     - Directly to the MCP server on mcptotal.
   - Agent may call:
     - Linkup (for real-time search).
     - Senso (for memory/context).
   - Logs agent reasoning as Message and returns reply.
3. Frontend displays reply and shows 👍 / 👎 buttons.

### Flow 5 — Feedback

1. User clicks thumbs up/down.
2. Frontend -> `POST /api/feedback`.
3. Backend:
   - Stores Feedback.
   - Optionally sends incremental update to Fastino for immediate profile adjustment.

### Flow 6 — Self-Improvement Cycle

1. Periodic or manual trigger -> `POST /api/self_improve`.
2. Backend:
   - Gathers recent Feedback for this user.
   - Calls Fastino to analyze patterns and update UserProfile.
   - Optionally uses Raindrop to refine agent tool selection or prompts.
   - Updates AgentInstance configs or creates new suggested templates.
3. Next time user logs in, they see evolved suggestions and improved agent behavior.

---

## 5. Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Set up project structure (frontend + backend)
- [ ] Implement user authentication (email-based)
- [ ] Create database schema / Senso integration
- [ ] Set up Fastino API integration
- [ ] Define initial AgentTemplates (3-5 types)

### Phase 2: Agent Creation
- [ ] Implement FrontMCP tool decorators
- [ ] Create MCP server deployment to mcptotal
- [ ] Integrate Raindrop for agent tool definitions
- [ ] Set up Airia AgentCard orchestration
- [ ] Fetch Freepik avatars for agent cards

### Phase 3: Chat & Tools
- [ ] Build chat UI with message history
- [ ] Implement Linkup integration for real-time search
- [ ] Set up Senso for context/memory storage
- [ ] Add feedback buttons (thumbs up/down)
- [ ] Create chat persistence layer

### Phase 4: Self-Evolution
- [ ] Implement feedback collection
- [ ] Build self-improvement cycle using Fastino
- [ ] Create agent behavior refinement logic
- [ ] Add user preference learning
- [ ] Implement personalized agent suggestions

### Phase 5: Polish & Demo
- [ ] UI/UX improvements
- [ ] Add visual indicators for tool usage
- [ ] Create demo flow documentation
- [ ] Test all prize track integrations
- [ ] Prepare hackathon presentation

---

## 6. Prize Track Alignment

- **Fastino**: User personalization, agent suggestions, self-improvement
- **Linkup**: Real-time web search in agents
- **Airia**: Hub agent orchestration
- **Raindrop**: Agent tool definitions and smart blocks
- **FrontMCP**: MCP server creation with decorators
- **mcptotal.io**: MCP server hosting and management
- **Freepik**: Agent avatar images
- **Senso**: Memory and context storage

---

## 7. Success Metrics

- User can log in and see personalized agent suggestions
- User can create and chat with multiple agent instances
- Agents successfully use Linkup for real-time data
- Feedback system visibly improves suggestions over time
- All sponsor tools are demonstrated in the flow
- Clean, impressive UI with Freepik avatars
- MCP servers visible in mcptotal dashboard

---

## 8. Technical Stack Recommendations

**Frontend:**
- React (via Lovable or Vite)
- TailwindCSS for styling
- Axios for API calls

**Backend:**
- Node.js + TypeScript
- Express.js
- PostgreSQL or SQLite (or use Senso directly)
- FrontMCP decorators
- SDK integrations for all sponsor tools

**Deployment:**
- Frontend: Vercel/Netlify
- Backend: Railway/Render/Fly.io
- MCP Servers: mcptotal.io

---

## Notes

This is a hackathon build plan focusing on demonstrating integration of multiple sponsor tools while building a cohesive, self-improving agent system. The key is to show clear usage of each tool and how they work together to create an evolving, personalized experience.
