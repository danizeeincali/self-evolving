# Agent Hub - Hackathon Demo Script

## Pre-Demo Checklist (30 mins before)

- [ ] All services running (frontend, backend, MCP servers)
- [ ] Browser tabs open:
  - [ ] Agent Hub app (production URL)
  - [ ] mcptotal dashboard
  - [ ] Code editor with FrontMCP decorators
  - [ ] Fastino profile JSON viewer
- [ ] Backup video ready to play
- [ ] Slides loaded
- [ ] Test email ready: `demo@agenthub.io`
- [ ] Network connection stable
- [ ] Screen sharing tested

## Demo Flow (30 minutes)

### MINUTE 0-3: Hook & Introduction

**[SLIDE 1: Title]**

> "Hi judges! I'm excited to show you Agent Hub - a self-evolving AI agent platform that learns your preferences and gets smarter over time."

**[SLIDE 2: Problem]**

> "The problem: Most AI agents are static. They don't learn from your feedback, they don't adapt to your style, and they're not personalized."

**[SLIDE 3: Solution]**

> "Agent Hub solves this by creating personalized AI agents that evolve based on your interactions. And we've integrated 8 sponsor tools to make this possible."

**[SLIDE 4: Architecture]**

> "Here's our architecture at a glance:
> - **Fastino** powers personalization and learning
> - **Linkup** provides real-time web data
> - **FrontMCP + mcptotal** enable scalable MCP architecture
> - **Freepik** makes it beautiful
> - Plus Airia, Raindrop, and Senso for advanced features"

---

### MINUTE 3-5: Login & Personalization (Fastino)

**[SWITCH TO: Agent Hub App]**

> "Let me show you how it works. I'll log in with my email..."

**Actions:**
1. Enter email: `demo@agenthub.io`
2. Click "Get Started"

**[WAIT for loading]**

> "Notice what's happening - Fastino is creating my personalization profile in real-time. It's analyzing default preferences and preparing agent suggestions."

**[SHOW: Fastino profile JSON in console/debug view]**

```json
{
  "user_email": "demo@agenthub.io",
  "preferences": {
    "agent_types": {
      "research_scout": 0.8,
      "task_planner": 0.6,
      "study_coach": 0.5
    },
    "topics": {},
    "tone": "balanced"
  }
}
```

> "Here's my initial profile - notice the scores for different agent types. Watch how these change as I use the system."

---

### MINUTE 5-8: Agent Suggestions (Fastino + Freepik)

**[SHOW: Agent cards displayed]**

> "Based on my profile, Agent Hub suggests these three agents for me:
> 1. **Research Scout** (0.8 score) - highest priority
> 2. **Task Planner** (0.6 score)
> 3. **Study Coach** (0.5 score)"

**[HOVER over cards]**

> "Notice the beautiful avatars - these are powered by the Freepik API. Each agent has a unique visual identity."

**[HIGHLIGHT: Freepik attribution in footer]**

> "And we're properly attributing Freepik as required."

---

### MINUTE 8-12: Chat with Agent (Linkup + FrontMCP + mcptotal)

**[CLICK: Research Scout card]**

> "Let me create a Research Scout agent and chat with it."

**[WAIT for agent creation]**

> "Behind the scenes, we're:
> 1. Instantiating an MCP server for this agent
> 2. Registering it with mcptotal
> 3. Connecting it to Linkup for real-time search"

**[SHOW: Chat window opens]**

> "Now let me ask a question that requires real-time data..."

**[TYPE:]** "What are the latest developments in AI agents from the past week?"

**[CLICK: Send]**

**[SHOW: Loading indicator]**

> "Watch this - you'll see 'Searching web with Linkup...' - this is a real API call to Linkup's search service for fresh data."

**[WAIT for response]**

**[RESPONSE APPEARS with sources:]**

```
Based on recent sources, here are the latest developments in AI agents:

1. **Multi-agent collaboration frameworks** - New research shows...
2. **Autonomous agent marketplaces** - Companies are building...
3. **Self-improving agents** - Breakthrough in...

Sources:
- https://techcrunch.com/2025/11/ai-agents-update
- https://arxiv.org/abs/2025.xxxxx
- https://www.theverge.com/ai-agents-news
```

> "There we go! Real-time data from Linkup, with source URLs for transparency."

**[HIGHLIGHT: Source URLs at bottom]**

---

### MINUTE 12-15: MCP Architecture (FrontMCP + mcptotal)

**[SWITCH TO: mcptotal dashboard tab]**

> "Now let me show you the MCP architecture. This is the mcptotal dashboard where our MCP servers are hosted."

**[SHOW: Dashboard with 3 active servers]**

```
Active MCP Servers:
- research-scout-mcp (Status: Active, Last ping: 2s ago)
- task-planner-mcp (Status: Active, Last ping: 5s ago)
- study-coach-mcp (Status: Active, Last ping: 3s ago)
```

> "Each agent type has its own MCP server, properly isolated and managed by mcptotal."

**[SWITCH TO: Code editor]**

> "And here's how we defined these servers using FrontMCP decorators..."

**[SHOW: research-scout.ts file]**

```typescript
import { mcptool, MCPServer } from 'frontmcp';

class ResearchScoutMCP extends MCPServer {
  @mcptool({
    description: "Search the web for real-time information",
    parameters: {
      query: { type: "string" },
      max_results: { type: "number" }
    }
  })
  async searchWeb(query: string, max_results: number = 5) {
    // Linkup integration
    const results = await linkup.search({
      query,
      limit: max_results,
      freshness: "recent"
    });

    return { results, tool_used: "linkup" };
  }
}
```

> "Notice the `@mcptool` decorator - this is FrontMCP's magic. It automatically exposes this method as an MCP tool, handles validation, and manages the protocol. Super clean!"

---

### MINUTE 15-18: Feedback Loop (Fastino)

**[SWITCH BACK TO: Agent Hub app - chat view]**

> "Now here's where the self-evolution happens. Let me give some feedback."

**[SCROLL to previous response]**

**[CLICK: Thumbs down button]**

> "I'm giving this response a thumbs down. Maybe I wanted more technical depth."

**[SHOW: Feedback recorded toast notification]**

> "Fastino immediately records this feedback and starts learning..."

**[CLICK: "View Profile" or open console]**

**[SHOW: Updated Fastino profile]**

```json
{
  "user_email": "demo@agenthub.io",
  "preferences": {
    "agent_types": {
      "research_scout": 0.75,  // Decreased!
      "task_planner": 0.6,
      "study_coach": 0.65      // Increased!
    },
    "topics": {
      "ai_agents": 0.8
    },
    "tone": "technical"        // Changed!
  },
  "last_updated": "2025-11-15T10:23:45Z"
}
```

> "See what happened? My Research Scout score dropped from 0.8 to 0.75 because I gave negative feedback. And Fastino detected I'm interested in AI agents and prefer a technical tone."

---

### MINUTE 18-21: Evolved Suggestions

**[CLICK: "Home" or "Suggested Agents"]**

**[SHOW: Updated agent cards - order may have changed]**

> "Now when I refresh my suggestions..."

**[WAIT for reload]**

> "Look at this! The order changed. Study Coach moved up because Fastino thinks I might prefer a different approach. This is real-time learning in action."

**[IF TIME: Create Study Coach agent and show different response style]**

---

### MINUTE 21-24: Optional Advanced Features

**[IF Airia is working:]**

> "We're also using Airia for orchestration. When an agent needs to use multiple tools, Airia decides the execution order and handles the coordination."

**[SHOW: Airia dashboard or logs]**

**[IF Raindrop is working:]**

> "Each agent's tool configuration is defined as a Raindrop manifest - here's what that looks like..."

**[SHOW: Manifest JSON]**

**[IF Senso is working:]**

> "And we're using Senso to store conversation context long-term, so agents can reference past conversations."

**[SHOW: Senso query result]**

---

### MINUTE 24-27: Prize Track Summary

**[SWITCH TO: Slides]**

**[SLIDE 9: Prize Track Alignment]**

> "Let me summarize how we've integrated all 8 sponsor tools:

**Fastino** ✅
- User profile creation
- Personalized agent suggestions
- Real-time feedback learning
- Self-improvement cycles

**Linkup** ✅
- Real-time web search
- Fresh data retrieval
- Source attribution

**FrontMCP** ✅
- Clean MCP tool definitions
- TypeScript decorators
- 3 servers implemented

**mcptotal** ✅
- MCP server hosting
- Server management
- Dashboard visibility

**Freepik** ✅
- Agent avatar images
- Proper attribution

**Airia** [✅/⚠️]
- Agent orchestration
- Multi-tool coordination

**Raindrop** [✅/⚠️]
- Tool manifests
- Smart routing blocks

**Senso** [✅/⚠️]
- Context storage
- Long-term memory"

---

### MINUTE 27-29: Technical Highlights

**[SLIDE 10: Key Technical Achievements]**

> "From a technical perspective, here's what we're proud of:

1. **True Self-Evolution**: Not just static prompts - actual learning from user feedback
2. **Real-time Personalization**: Fastino updates profiles immediately
3. **Scalable Architecture**: MCP servers allow infinite agent types
4. **Clean Integrations**: Every sponsor tool has a clear, demonstrable role
5. **Production-Ready**: Deployed on Vercel + Railway, fully functional"

**[SHOW: Architecture diagram]**

---

### MINUTE 29-30: Closing & Q&A

**[SLIDE 11: Thank You]**

> "That's Agent Hub - self-evolving AI agents that learn from you. We believe the future of AI is personalized, adaptive, and user-driven.

Thank you! I'm happy to answer any questions."

---

## Backup Plans

### If Live Demo Fails

**Option 1: Use Backup Video**
> "Let me show you a pre-recorded demo that walks through the full flow..."

**Option 2: Screenshots**
> "Here are screenshots of the working system..."

**Option 3: Code Walkthrough**
> "Let me show you the implementation instead..."

### If Specific Tool Fails

**If Fastino fails:**
> "We've hardcoded some profile changes to demonstrate the concept, but in production this would be Fastino's real-time learning..."

**If Linkup fails:**
> "I'll show you the code integration and explain how Linkup provides real-time search..."

**If mcptotal fails:**
> "Our MCP servers are running locally - here's the dashboard view we'd see on mcptotal..."

---

## Q&A Preparation

### Expected Questions

**Q: "How does Fastino's learning work?"**
A: "Fastino maintains a personalization profile keyed by user email. Every interaction - agent creation, chat, feedback - sends events to Fastino. It analyzes patterns and updates preference scores in real-time. We call `analyzePatterns()` to get insights and `updateProfile()` to apply changes."

**Q: "Can agents share knowledge?"**
A: "Yes! Through Senso's shared context storage. When one agent learns something useful, we store it in Senso tagged by topic. Other agents can retrieve that context. We could also use Raindrop's routing blocks to share tool configurations."

**Q: "How do you handle agent conflicts?"**
A: "Great question! Currently each agent is isolated with its own MCP server. If we needed coordination, we'd use Airia's orchestration layer to manage multi-agent conversations and conflict resolution."

**Q: "What's your user acquisition strategy?"**
A: "Post-hackathon, we'd focus on developer communities who want personalized AI assistants. Freemium model: free for 3 agents, paid for unlimited + advanced features. Partnership with MCP ecosystem."

**Q: "How does this scale?"**
A: "MCP architecture is inherently scalable - each agent is a separate server that can be deployed independently. mcptotal handles hosting and load balancing. Fastino profiles are lightweight JSON. We could scale to millions of users."

**Q: "Why not use a traditional database?"**
A: "For the hackathon, we optimized for speed with in-memory storage. Production would use PostgreSQL for relational data + Senso for vector/context storage + Fastino for profiles. Multi-tier architecture."

**Q: "What makes this different from ChatGPT custom GPTs?"**
A: "Three key differences:
1. **True learning** - Fastino actively updates behavior, not static prompts
2. **MCP architecture** - Composable, standardized tool integration
3. **Personal evolution** - Each user gets uniquely adapted agents"

**Q: "Can I export my agents?"**
A: "Not in the demo, but roadmap feature! Export as MCP server definition + Fastino profile snapshot. Import into any MCP-compatible system. Full portability."

---

## Timing Alternatives

### 15-Minute Version (Rapid Demo)

- **0-2 min**: Hook + problem + solution
- **2-5 min**: Login + suggestions (Fastino + Freepik)
- **5-9 min**: Chat with Linkup search
- **9-11 min**: Feedback → profile change
- **11-13 min**: MCP architecture (FrontMCP + mcptotal)
- **13-15 min**: Prize track summary + Q&A

### 45-Minute Version (Deep Dive)

Add to 30-min version:
- **+5 min**: Detailed code walkthrough of each integration
- **+5 min**: Create second agent and show different behavior
- **+5 min**: Live debugging of self-improvement cycle

---

## Demo Environment Setup

### Required Tabs (in order)

1. Agent Hub app (main demo)
2. mcptotal dashboard
3. Code editor (FrontMCP decorators)
4. Browser console (Fastino profiles)
5. Backup video
6. Presentation slides

### Console Commands Ready

```javascript
// View current Fastino profile
localStorage.getItem('fastino_profile')

// Trigger self-improvement manually
fetch('/api/self_improve', { method: 'POST' })

// View all feedback
localStorage.getItem('feedback_history')

// Reset demo state
localStorage.clear()
```

### Test Data Ready

- Email: `demo@agenthub.io`
- Test questions:
  - "What's new in AI agents?"
  - "Help me plan my week"
  - "Explain quantum computing"

---

## Post-Demo Actions

- [ ] Share GitHub repo link
- [ ] Share live demo URL
- [ ] Exchange contact info
- [ ] Note judge feedback
- [ ] Thank sponsors
- [ ] Network with other teams

Good luck! 🚀
