# 3-Agent Parallel Execution Plan
## Agent Hub — Coordinated Development Strategy

**Total Timeline:** 3 Hours
**Agents:** Frontend, Backend, Raindrop
**Coordination:** Claude Flow hooks + shared memory

---

## 1. Agent Roles & Responsibilities

### Agent 1: Frontend Developer
**Type:** `coder`
**Focus:** React UI, Freepik integration, chat interface
**Primary Files:** `/app/frontend/*`
**Dependencies:** Backend API contracts (from memory)

**Core Responsibilities:**
- Login view (email input)
- Agent suggestion cards with Freepik avatars
- Chat interface with message history
- Feedback buttons (thumbs up/down)
- Agent instance management

**Key Skills:**
- React + TypeScript
- TailwindCSS styling
- Axios for API calls
- Real-time UI updates

---

### Agent 2: Backend Developer
**Type:** `backend-dev`
**Focus:** Express API, Fastino, Linkup, FrontMCP integration
**Primary Files:** `/app/backend/*`
**Dependencies:** Raindrop API URL (from memory)

**Core Responsibilities:**
- REST API endpoints (wraps Raindrop)
- Fastino personalization integration
- Linkup real-time search integration
- FrontMCP MCP server deployment
- Airia agent orchestration (optional)
- Senso context storage (optional)

**Key Skills:**
- Node.js + TypeScript + Express
- External API integration
- MCP server creation
- Authentication/sessions

---

### Agent 3: Raindrop Developer
**Type:** `code-analyzer`
**Focus:** LiquidMetal data layer, smart blocks
**Primary Files:** Raindrop IDE (external platform)
**Dependencies:** None (foundational layer)

**Core Responsibilities:**
- Define 5 data models (Users, Templates, Instances, Messages, Feedback)
- Auto-generate REST APIs
- Create 3 smart blocks (suggest_agents, improve_profile, analytics)
- Seed initial data (5 agent templates)
- Deploy and share API URL

**Key Skills:**
- Raindrop/LiquidMetal platform
- Visual data modeling
- API design
- JSON/REST conventions

---

## 2. Communication Protocol

### Pre-Task Setup (All Agents)
```bash
# Restore shared session
npx claude-flow@alpha hooks session-restore --session-id "swarm-agent-hub"

# Announce start
npx claude-flow@alpha hooks pre-task --description "[Agent Role] starting work on [Component]"
```

### During Work (Memory Sharing)
```bash
# After completing a module, share contract
npx claude-flow@alpha hooks post-edit \
  --file "[file-path]" \
  --memory-key "swarm/[agent-role]/[module-name]" \
  --value "{...contract/spec...}"

# Notify other agents
npx claude-flow@alpha hooks notify --message "[Agent Role] completed [Module]. Contract available at swarm/[agent-role]/[module-name]"
```

### Post-Task Completion
```bash
# Mark task complete
npx claude-flow@alpha hooks post-task --task-id "[task-id]"

# Export metrics
npx claude-flow@alpha hooks session-end --export-metrics true
```

---

## 3. Dependency Graph

```
┌──────────────┐
│   Raindrop   │ ← Foundation (no dependencies)
│    Agent     │
└──────┬───────┘
       │ Shares: API URL + endpoints
       ↓
┌──────────────┐
│   Backend    │ ← Depends on Raindrop API
│    Agent     │
└──────┬───────┘
       │ Shares: REST API contracts
       ↓
┌──────────────┐
│   Frontend   │ ← Depends on Backend API
│    Agent     │
└──────────────┘
```

**Critical Path:**
1. **Raindrop** must deploy first (provides data layer)
2. **Backend** integrates Raindrop + builds business logic
3. **Frontend** consumes Backend API

**Parallel Work Possible:**
- Raindrop can work fully independently (Hour 1)
- Backend can scaffold while waiting for Raindrop URL (Hour 1)
- Frontend can build UI mockups while waiting for API (Hour 1)

---

## 4. Shared Memory Schema

### Memory Keys (JSON Storage)

**Raindrop Agent:**
```json
{
  "swarm/raindrop/api-url": "https://agent-hub.raindrop.run",
  "swarm/raindrop/endpoints": {
    "users": "/api/users",
    "templates": "/api/agent_templates",
    "instances": "/api/agent_instances",
    "messages": "/api/messages",
    "feedback": "/api/feedback",
    "suggest_agents": "/api/blocks/suggest_agents",
    "improve_profile": "/api/blocks/improve_profile"
  },
  "swarm/raindrop/status": "deployed",
  "swarm/raindrop/seed-data": "5 templates loaded"
}
```

**Backend Agent:**
```json
{
  "swarm/backend/api-base": "http://localhost:3000/api",
  "swarm/backend/endpoints": {
    "login": "POST /api/login",
    "suggestions": "GET /api/agents/suggestions",
    "create-instance": "POST /api/agents/instances",
    "chat": "POST /api/chat/send",
    "history": "GET /api/chat/history",
    "feedback": "POST /api/feedback",
    "improve": "POST /api/self_improve"
  },
  "swarm/backend/env": {
    "RAINDROP_API_URL": "https://agent-hub.raindrop.run",
    "FASTINO_API_KEY": "required",
    "LINKUP_API_KEY": "required",
    "FREEPIK_API_KEY": "required"
  },
  "swarm/backend/status": "running"
}
```

**Frontend Agent:**
```json
{
  "swarm/frontend/url": "http://localhost:5173",
  "swarm/frontend/status": "running",
  "swarm/frontend/features": [
    "login-view",
    "agent-cards",
    "chat-interface",
    "feedback-buttons"
  ]
}
```

---

## 5. Hour-by-Hour Agent Tasks

### Hour 1: Foundation (Parallel Setup)

**Raindrop Agent:**
- [ ] Create Raindrop project
- [ ] Define Users collection
- [ ] Define AgentTemplates collection
- [ ] Seed 5 agent templates
- [ ] Define AgentInstances collection
- [ ] Deploy + share API URL via memory

**Backend Agent:**
- [ ] Setup Express + TypeScript project
- [ ] Define API route structure (stubs)
- [ ] Integrate Fastino SDK (personalization)
- [ ] Integrate Linkup SDK (search)
- [ ] Wait for Raindrop URL, then connect

**Frontend Agent:**
- [ ] Setup React + Vite project
- [ ] Create login view (email input)
- [ ] Build agent card components
- [ ] Integrate Freepik API (fetch avatars)
- [ ] Create chat UI skeleton

---

### Hour 2: Integration (Parallel Development)

**Raindrop Agent:**
- [ ] Define Messages collection
- [ ] Define Feedback collection
- [ ] Create `suggest_agents` smart block
- [ ] Create `improve_profile` smart block
- [ ] Test all endpoints with Postman

**Backend Agent:**
- [ ] Implement `POST /api/login` (Fastino integration)
- [ ] Implement `GET /api/agents/suggestions` (Raindrop + Fastino)
- [ ] Implement `POST /api/agents/instances` (Raindrop + FrontMCP)
- [ ] Implement `POST /api/chat/send` (Airia + Linkup + Raindrop)
- [ ] Share API contracts via memory

**Frontend Agent:**
- [ ] Connect login to backend API
- [ ] Fetch and display agent suggestions
- [ ] Implement "Create Agent" flow
- [ ] Build chat message display
- [ ] Add feedback buttons

---

### Hour 3: Polish (Parallel Finalization)

**Raindrop Agent:**
- [ ] Create analytics block
- [ ] Optimize queries (indexes)
- [ ] Document API for demo
- [ ] Export Postman collection

**Backend Agent:**
- [ ] Implement `GET /api/chat/history`
- [ ] Implement `POST /api/feedback`
- [ ] Implement `POST /api/self_improve` (calls Raindrop block)
- [ ] Deploy MCP servers to mcptotal
- [ ] Test end-to-end flow

**Frontend Agent:**
- [ ] Implement chat history loading
- [ ] Add feedback submission
- [ ] Polish UI/UX (TailwindCSS)
- [ ] Add loading states
- [ ] Test all user flows

---

## 6. Integration Checkpoints

### Checkpoint 1 (End of Hour 1)
**Raindrop → Backend:**
- Raindrop shares API URL
- Backend tests basic CRUD (create user, fetch templates)

**Backend → Frontend:**
- Backend shares API base URL
- Frontend tests login endpoint (stub)

### Checkpoint 2 (End of Hour 2)
**Full Stack Test:**
- User logs in → sees suggestions → creates agent → sends message
- All 3 agents verify their components work together

### Checkpoint 3 (End of Hour 3)
**Demo Readiness:**
- Full user flow works end-to-end
- All sponsor tools visible (Fastino, Linkup, Freepik, Raindrop, FrontMCP, mcptotal)
- Feedback loop functional

---

## 7. Conflict Resolution

### Scenario: API Contract Mismatch
**Example:** Backend expects `user_id`, Raindrop returns `email`

**Resolution:**
1. Raindrop Agent checks memory for Backend requirements
2. If mismatch found, Raindrop updates endpoint OR Backend adapts
3. Updated contract posted to memory
4. Notify via hooks

### Scenario: Delayed Dependency
**Example:** Raindrop deployment delayed

**Resolution:**
1. Backend uses mock data temporarily
2. Frontend continues UI development
3. Raindrop notifies when ready via hooks
4. Backend switches to real API

---

## 8. Success Metrics (Per Agent)

### Raindrop Agent
- [ ] 5 collections deployed
- [ ] 8 endpoints accessible
- [ ] 3 smart blocks functional
- [ ] <200ms API response times
- [ ] Seed data loaded

### Backend Agent
- [ ] 7 REST endpoints working
- [ ] Fastino integration (personalization)
- [ ] Linkup integration (search)
- [ ] FrontMCP MCP server deployed
- [ ] Senso integration (optional bonus)

### Frontend Agent
- [ ] Login flow complete
- [ ] Agent suggestions display
- [ ] Chat interface functional
- [ ] Feedback buttons working
- [ ] Freepik avatars loaded

---

## 9. Coordination Commands

### Initialize Swarm (Solo Developer)
```bash
# Start session
npx claude-flow@alpha hooks session-start --session-id "swarm-agent-hub"

# Initialize mesh topology (all agents equal peers)
npx claude-flow@alpha swarm init mesh --max-agents 3 --strategy balanced
```

### Spawn All 3 Agents (Single Message)
Use Claude Code's Task tool:
```javascript
Task("Raindrop Agent", "Build complete data layer in Raindrop IDE. See RAINDROP-SPEC.md. Deploy and share API URL via memory.", "code-analyzer")

Task("Backend Agent", "Build Express API. Integrate Fastino, Linkup, FrontMCP. Wrap Raindrop API. See 3-AGENT-PLAN.md.", "backend-dev")

Task("Frontend Agent", "Build React UI. Integrate Freepik avatars. Create chat interface. See 3-AGENT-PLAN.md.", "coder")
```

### Monitor Progress
```bash
# Check swarm status
npx claude-flow@alpha swarm status

# View shared memory
npx claude-flow@alpha hooks session-restore --session-id "swarm-agent-hub"
```

---

## 10. Emergency Protocols

### If Agent Gets Stuck
1. Other agents continue (parallel work)
2. Solo developer intervenes manually
3. Restart agent with adjusted instructions
4. Update memory with manual fix

### If Integration Fails
1. Revert to last working checkpoint
2. Use memory to identify mismatch
3. Coordinate fix via hooks
4. Re-test integration

### If Running Out of Time
**Priority Order:**
1. Core user flow (login → chat → feedback)
2. Visible sponsor integrations (Fastino, Linkup, Freepik)
3. Self-improvement cycle
4. Polish/UX

**Drop if Needed:**
- Senso integration (optional)
- MCP server deployment (can demo locally)
- Advanced analytics

---

## 11. Final Deliverables (All Agents)

### Raindrop Agent
- Deployed Raindrop project URL
- API documentation (Postman collection)
- Seed data loaded

### Backend Agent
- GitHub repo with backend code
- Environment variables documented
- Deployed API (Railway/Render) or local with ngrok

### Frontend Agent
- GitHub repo with frontend code
- Deployed UI (Vercel/Netlify) or local
- Demo-ready screenshots

### Shared
- Working end-to-end demo
- All sponsor tools visible in logs/UI
- 3-minute demo script

---

## 12. Demo Script (3 Minutes)

**Minute 1: Setup & Personalization**
1. Show login view → enter email
2. Backend calls Fastino (show logs)
3. Display personalized agent suggestions
4. Freepik avatars visible

**Minute 2: Agent Interaction**
5. Create "Research Scout" agent
6. FrontMCP MCP server deployed (show mcptotal dashboard)
7. Send message: "What's the latest on AI safety?"
8. Linkup searches web (show tool call in logs)
9. Agent responds with citations
10. Click thumbs up

**Minute 3: Self-Evolution**
11. Trigger self-improvement cycle (Raindrop smart block)
12. Show updated Fastino profile (Research Scout score increased)
13. Refresh suggestions → Research Scout now top-ranked
14. Show Raindrop data (feedback processed)
15. **End:** All 8 sponsor tools used and visible!

---

## Notes for Solo Developer

1. **Trust the Agents:** Let them work in parallel, resist micromanaging
2. **Use Memory:** Always check `swarm/*` keys for latest status
3. **Monitor via Hooks:** Set up notifications for key milestones
4. **Checkpoint Often:** Test integration every hour
5. **Stay Focused:** Prioritize core demo flow over perfection
