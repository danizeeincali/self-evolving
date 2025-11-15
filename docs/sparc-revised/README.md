# REVISED SPARC Plan — Agent Hub (3-Hour Build)

## 📋 Overview

This is a **REVISED** SPARC plan for building Agent Hub in **3 hours** using **3 parallel coding agents** coordinated via Claude Flow. The original 48-hour plan has been compressed to hackathon speed with aggressive parallelization.

**Key Changes from Original PRD:**
- ⏱️ **Timeline:** 3 hours (not 48 hours!)
- 🤖 **Agents:** 3 parallel agents (Frontend, Backend, Raindrop)
- 💾 **Database:** Raindrop (LiquidMetal) - visual data layer + auto-generated APIs
- 🔌 **MCP:** Hybrid FrontMCP (local dev) + mcptotal.io (cloud demo)
- 👤 **Team:** Solo developer managing 3 autonomous agents

---

## 📚 Document Structure

### 1. [RAINDROP-SPEC.md](./RAINDROP-SPEC.md)
**Complete specification for building in Raindrop IDE**

**What it contains:**
- 5 data models (Users, AgentTemplates, AgentInstances, Messages, Feedback)
- 8 auto-generated REST API endpoints
- 3 LiquidMetal smart blocks (suggest_agents, improve_profile, analytics)
- Integration contracts for Backend Agent
- Deployment instructions

**Who uses it:** Raindrop Agent (Agent 3)

**Critical outputs:**
- Production API URL: `https://agent-hub-xyz.raindrop.run`
- Postman collection for all endpoints
- Seeded data (5 agent templates)

---

### 2. [3-AGENT-PLAN.md](./3-AGENT-PLAN.md)
**Parallel work coordination for 3 agents**

**What it contains:**
- Agent roles & responsibilities
- Communication protocol (Claude Flow hooks)
- Dependency graph (who waits for whom)
- Shared memory schema (JSON keys)
- Hour-by-hour task breakdown per agent
- Integration checkpoints (3 checkpoints)
- Conflict resolution strategies
- Success metrics per agent

**Who uses it:** All 3 agents + solo developer

**Critical patterns:**
- Memory sharing: `swarm/[agent]/[module]`
- Hooks coordination: pre-task → post-edit → post-task
- Parallel work blocks (Hour 1, 2, 3)

---

### 3. [3-HOUR-TIMELINE.md](./3-HOUR-TIMELINE.md)
**Minute-by-minute execution plan**

**What it contains:**
- Hour 1 (Foundation): Project setup, core models, integration points
- Hour 2 (Features): Chat, MCP servers, Linkup, smart blocks
- Hour 3 (Polish): Deployment, testing, demo prep
- 3 integration checkpoints (every 60 minutes)
- Contingency plans (if running behind)
- Demo script (3 minutes)
- Final deliverables checklist

**Who uses it:** Solo developer for monitoring progress

**Critical milestones:**
- Minute 50: Raindrop deployed, Backend connected
- Minute 120: Full user flow working (login → chat → feedback)
- Minute 180: Demo-ready with all sponsor tools visible

---

### 4. [MCP-HYBRID-GUIDE.md](./MCP-HYBRID-GUIDE.md)
**FrontMCP + mcptotal.io integration strategy**

**What it contains:**
- FrontMCP TypeScript decorators (tool definitions)
- Local MCP server setup (stdio transport)
- mcptotal.io deployment automation
- Airia integration (agent orchestration)
- Fallback strategy (local if cloud fails)
- Troubleshooting guide
- Environment variable reference

**Who uses it:** Backend Agent (Agent 2)

**Critical outputs:**
- 3+ MCP tools defined (search_web, store_context, update_agent_config)
- Deployed MCP servers on mcptotal.io
- Local fallback for offline demo

---

## 🚀 Quick Start (For Solo Developer)

### Step 1: Initialize Swarm (1 minute)
```bash
# Start coordinated session
npx claude-flow@alpha hooks session-start --session-id "swarm-agent-hub"

# Initialize mesh topology (3 equal agents)
npx claude-flow@alpha swarm init mesh --max-agents 3 --strategy balanced
```

### Step 2: Spawn All 3 Agents (Single Claude Code Message)
```javascript
// Use Claude Code's Task tool to spawn all agents in parallel
Task("Raindrop Agent", `
Build complete data layer in Raindrop IDE following RAINDROP-SPEC.md.
Deploy and share API URL via memory key: swarm/raindrop/api-url
`, "code-analyzer")

Task("Backend Agent", `
Build Express API integrating Fastino, Linkup, FrontMCP.
Wrap Raindrop API. Deploy MCP servers to mcptotal.
Follow 3-AGENT-PLAN.md and MCP-HYBRID-GUIDE.md.
`, "backend-dev")

Task("Frontend Agent", `
Build React UI with login, agent cards, chat interface.
Integrate Freepik avatars. Follow 3-AGENT-PLAN.md.
`, "coder")
```

### Step 3: Monitor Progress (Every 30 minutes)
```bash
# Check swarm status
npx claude-flow@alpha swarm status --verbose

# View shared memory (agent coordination)
npx claude-flow@alpha hooks session-restore --session-id "swarm-agent-hub"

# Check individual agent metrics
npx claude-flow@alpha agent metrics
```

### Step 4: Integration Checkpoints
**Checkpoint 1 (60 min):** Raindrop API deployed → Backend connects
**Checkpoint 2 (120 min):** Full chat flow working end-to-end
**Checkpoint 3 (180 min):** Demo ready with all sponsor tools

### Step 5: Demo (3 minutes)
Follow demo script in [3-HOUR-TIMELINE.md](./3-HOUR-TIMELINE.md#demo-script-3-minutes)

---

## 🎯 Sponsor Tool Coverage (All 8 Integrated)

| Tool | Purpose | Agent | Visibility in Demo |
|------|---------|-------|-------------------|
| **Fastino** | Personalization profiles | Backend | Login flow, profile updates |
| **Linkup** | Real-time web search | Backend | Tool calls in chat logs |
| **Airia** | Agent orchestration | Backend | Chat responses |
| **Raindrop** | Data layer + smart blocks | Raindrop | Dashboard, API calls |
| **FrontMCP** | MCP tool decorators | Backend | Code, tool definitions |
| **mcptotal.io** | MCP server hosting | Backend | Dashboard screenshot |
| **Freepik** | Agent avatars | Frontend | Visible in UI cards |
| **Senso** | Memory storage (optional) | Backend | Context logs (bonus) |

**Demo Proof Points:**
1. Show Fastino API call logs (personalization)
2. Show Linkup search results in agent response
3. Show mcptotal dashboard with deployed MCP servers
4. Show Freepik avatars in agent cards
5. Show Raindrop dashboard with stored data
6. Show FrontMCP tool definitions in code
7. Show self-improvement cycle (Raindrop smart block)

---

## ⚡ Critical Success Factors

### 1. Parallel Execution
**All agents work simultaneously, not sequentially**
- Raindrop builds data layer (independent)
- Backend scaffolds while waiting for Raindrop URL
- Frontend builds UI mockups while waiting for API

### 2. Memory-Based Coordination
**No manual handoffs, all via Claude Flow hooks**
```bash
# Raindrop shares API URL
npx claude-flow@alpha hooks post-edit \
  --memory-key "swarm/raindrop/api-url" \
  --value "https://agent-hub.raindrop.run"

# Backend retrieves and uses it
npx claude-flow@alpha hooks session-restore
# Memory contains: swarm/raindrop/api-url
```

### 3. Aggressive Timebox
**3 hours means ruthless prioritization**
- **Must Have:** Login, suggestions, chat, Linkup, feedback
- **Should Have:** MCP servers, self-improvement
- **Nice to Have:** Senso, analytics, polish

### 4. Fallback Plans
**Every critical path has a Plan B**
- mcptotal fails → Use local MCP servers
- Raindrop slow → Use mock data temporarily
- Integration breaks → Raindrop/Backend debug together via hooks

---

## 📊 Agent Coordination Graph

```
HOUR 1: FOUNDATION
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Raindrop   │────→│   Backend   │────→│  Frontend   │
│   Agent     │     │    Agent    │     │    Agent    │
└─────────────┘     └─────────────┘     └─────────────┘
    ↓ Deploy            ↓ Scaffold          ↓ UI Mockups
    ↓ Share URL         ↓ Connect           ↓ Components
    ✅ Independent      ⏳ Waits for URL    ⏳ Waits for API

HOUR 2: INTEGRATION
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Raindrop   │←───→│   Backend   │←───→│  Frontend   │
│ Smart Blocks│     │ MCP Deploy  │     │ Chat UI     │
└─────────────┘     └─────────────┘     └─────────────┘
    ↕ Test              ↕ Integrate         ↕ Connect
    ↕ Optimize          ↕ Linkup            ↕ Feedback
    ✅ Endpoints        ✅ Tools             ✅ Components

HOUR 3: POLISH
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Raindrop   │     │   Backend   │     │  Frontend   │
│  Analytics  │     │   Deploy    │     │   Deploy    │
└─────────────┘     └─────────────┘     └─────────────┘
    ↓ Docs              ↓ Railway           ↓ Vercel
    ↓ Postman           ↓ Test              ↓ Screenshots
    ✅ Production       ✅ Production        ✅ Production

DEMO READY (180 minutes)
```

---

## 🛠️ Technology Stack

**Frontend (Agent 1):**
- React + TypeScript (Vite)
- TailwindCSS
- Axios
- Freepik API

**Backend (Agent 2):**
- Node.js + TypeScript
- Express.js
- FrontMCP (MCP decorators)
- Fastino SDK
- Linkup SDK
- Airia SDK
- Senso SDK (optional)

**Data Layer (Agent 3):**
- Raindrop (LiquidMetal)
- Auto-generated REST APIs
- Smart blocks (custom logic)

**Deployment:**
- Frontend: Vercel/Netlify
- Backend: Railway/Render
- MCP Servers: mcptotal.io (+ local fallback)
- Data: Raindrop Cloud

---

## 📁 File Structure (After Build)

```
/workspaces/self-evolving/
├── docs/
│   ├── PRD-AgentHub.md              # Original PRD
│   └── sparc-revised/               # THIS FOLDER
│       ├── README.md                # This file
│       ├── RAINDROP-SPEC.md         # Raindrop build guide
│       ├── 3-AGENT-PLAN.md          # Agent coordination
│       ├── 3-HOUR-TIMELINE.md       # Minute-by-minute plan
│       └── MCP-HYBRID-GUIDE.md      # FrontMCP + mcptotal
├── app/
│   ├── frontend/                    # React app (Agent 1)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   └── Chat.tsx
│   │   │   ├── utils/
│   │   │   │   └── freepik.ts
│   │   │   └── App.tsx
│   │   └── package.json
│   └── backend/                     # Express API (Agent 2)
│       ├── src/
│       │   ├── mcp/
│       │   │   ├── tools/
│       │   │   │   ├── linkup.ts
│       │   │   │   ├── senso.ts
│       │   │   │   └── state.ts
│       │   │   ├── server.ts
│       │   │   ├── local.ts
│       │   │   └── deploy.ts
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── agents.ts
│       │   │   ├── chat.ts
│       │   │   └── feedback.ts
│       │   └── index.ts
│       └── package.json
└── raindrop/                        # External (Raindrop IDE)
    └── agent-hub-data/              # Agent 3's work
        ├── models/                  # 5 collections
        ├── blocks/                  # 3 smart blocks
        └── deployment/              # Production URL
```

---

## 🎓 Key Learnings (SPARC Methodology Applied)

### Specification Phase (Compressed)
- **Original:** Detailed requirements gathering
- **Revised:** Pre-defined PRD + sponsor tool constraints
- **Time:** 0 minutes (already done)

### Pseudocode Phase (Integrated)
- **Original:** Algorithm design before coding
- **Revised:** Smart blocks in Raindrop (visual logic)
- **Time:** Built into Hour 2 (improve_profile block)

### Architecture Phase (Parallel)
- **Original:** Sequential system design
- **Revised:** 3 agents design their layers simultaneously
- **Time:** Hour 1 (all agents scaffold together)

### Refinement Phase (Continuous)
- **Original:** TDD with test-first approach
- **Revised:** Integration checkpoints every hour
- **Time:** Checkpoints at 60, 120, 180 minutes

### Completion Phase (Demo-Focused)
- **Original:** Full integration testing
- **Revised:** Demo script + visible sponsor tools
- **Time:** Hour 3 (polish + deployment)

---

## 🚨 Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Raindrop deployment fails | Low | High | Use mock data, deploy later |
| mcptotal.io timeout | Medium | Medium | Fallback to local MCP servers |
| Linkup API rate limit | Low | Medium | Cache results, reduce queries |
| Agent gets stuck | Medium | High | Solo developer intervenes manually |
| Integration breaks | Medium | High | Checkpoints every hour, rollback |
| Running out of time | High | High | Priority tiers, drop Nice-to-Have |

---

## 📞 Support & Resources

**Claude Flow Documentation:**
- Hooks: https://github.com/ruvnet/claude-flow#hooks
- Swarms: https://github.com/ruvnet/claude-flow#swarms
- Memory: https://github.com/ruvnet/claude-flow#memory

**Sponsor Tool Docs:**
- Fastino: [API docs]
- Linkup: [API docs]
- Airia: [API docs]
- Raindrop: [LiquidMetal guide]
- FrontMCP: [Decorator reference]
- mcptotal.io: [Deployment guide]
- Freepik: [API reference]
- Senso: [SDK docs]

**Raindrop IDE:**
- Platform: https://raindrop.io
- Create project: https://ide.raindrop.io/new

---

## ✅ Final Checklist (Before Starting)

**Environment Setup:**
- [ ] Claude Flow installed: `npm install -g claude-flow@alpha`
- [ ] All sponsor API keys acquired
- [ ] Raindrop account created
- [ ] mcptotal.io account created
- [ ] GitHub repos ready (frontend, backend)

**Documentation Review:**
- [ ] Read RAINDROP-SPEC.md (Agent 3 guide)
- [ ] Read 3-AGENT-PLAN.md (coordination protocol)
- [ ] Read 3-HOUR-TIMELINE.md (timeline)
- [ ] Read MCP-HYBRID-GUIDE.md (Backend Agent guide)

**Coordination Setup:**
- [ ] Start session: `npx claude-flow@alpha hooks session-start --session-id "swarm-agent-hub"`
- [ ] Initialize swarm: `npx claude-flow@alpha swarm init mesh --max-agents 3`
- [ ] Spawn agents via Claude Code Task tool

**Demo Preparation:**
- [ ] Install screen recording software
- [ ] Prepare Postman for API testing
- [ ] Have mcptotal dashboard open
- [ ] Have Raindrop dashboard open

---

## 🎬 Next Steps

1. **Review all 4 documents** (this README + 3 guides)
2. **Set up environment** (API keys, accounts)
3. **Start timer** (3 hours)
4. **Spawn agents** (Claude Code Task tool)
5. **Monitor progress** (every 30 minutes)
6. **Demo!** (3-minute script)

**Remember:**
- ⏱️ Speed > Perfection
- 🤖 Trust the agents (parallel work)
- 💾 Use memory for coordination
- 🎯 Core demo flow first, polish later
- 🚨 Fallback plans ready

---

**Total Build Time:** 3 hours (180 minutes)
**Total Lines of Code:** ~2,000 (estimated, across all 3 agents)
**Total Sponsor Tools:** 8 (all integrated)
**Demo Duration:** 3 minutes
**Expected Outcome:** Working hackathon demo with self-improving agents

🚀 **LET'S BUILD AGENT HUB IN 3 HOURS!**
