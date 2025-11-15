# Master List of Tools + Links + What They Do

Complete reference for all sponsor tools used in Agent Hub hackathon project.

---

## Senso

**Link:** https://docs.senso.ai

**What it does:** Context OS for ingesting documents, emails, raw content; normalizes data into schema-safe JSON and provides rule-driven context windows.

**Use in Agent Hub:** Memory layer for logs, agent configs, user profiles.

**Integration Points:**
- Store user profiles and preferences
- Save chat history and context
- Store agent configurations
- Log feedback and learning data

---

## Airia

**Signup:** https://airia.com/open-registration/?utm_source=creators_corner_sf11152025&utm_medium=hackathon&utm_campaign=11152025

**Docs:** https://api.airia.ai/docs/#tag/agentcard/post/v1/AgentCard

**Docs Hub:** https://explore.airia.com/home

**PDF:** https://bit.ly/4mEZ5CB

**Discord:** https://discord.com/channels/1375241114818187295/1429912842600972319

**What it does:** Agent orchestration platform for routing between MCP tools/servers.

**Use in Agent Hub:** The Hub Agent lives in Airia.

**Integration Points:**
- Create AgentCard for each agent instance
- Route between MCP servers
- Orchestrate multi-tool workflows
- Handle conversation flow

---

## LiquidMetal / Raindrop

**Site:** https://liquidmetal.ai/

**Tutorial:** https://docs.liquidmetal.ai/tutorials/raindrop-code-quickstart/

**What it does:** Smart Building Blocks for constructing agent pipelines; can auto-generate MCP servers.

**Use in Agent Hub:** Build micro-agent logic, critic agents, self-improvement workflows.

**Integration Points:**
- **Data layer**: Build entire API/database in Raindrop IDE
- **Smart blocks**: suggest_agents, improve_profile, analytics
- **Agent logic**: Scoring, routing, personalization
- **Self-improvement**: Critic/feedback processing

**Building in Raindrop:**
- 5 data models (User, AgentTemplate, AgentInstance, Message, Feedback)
- 8 REST endpoints (auto-generated)
- 3 LiquidMetal smart blocks
- Integration with Fastino for personalization

---

## AgentFront

**Link:** https://docs.agentfront.dev/getting-started/welcome

**What it does:** Framework for agent workflow hosting and routing.

**Use in Agent Hub:** Optional additional routing layer.

**Integration Points:**
- Optional orchestration layer
- Workflow management
- Agent lifecycle handling

---

## Freepik API

**API:** https://www.freepik.com/api

**Node SDK:** https://github.com/freepik-company/freepik-api-nodes

**Hackathon Repo:** https://github.com/freepik-company/ai-agents-hackathon

**What it does:** Generate or fetch high-quality images/icons for agent avatars/UI polish.

**Use in Agent Hub:** Visual identity for agent cards.

**Integration Points:**
- Fetch avatar images for agent cards
- Generate custom agent visuals
- UI polish and branding
- Demo visual appeal

**Example Usage:**
```javascript
import { FreepikClient } from 'freepik-api-nodes';

const freepik = new FreepikClient({ apiKey: FREEPIK_API_KEY });
const avatar = await freepik.images.search({ query: 'robot assistant' });
```

---

## Fastino

**Link:** https://fastino.ai/personalization

**What it does:** Hyper-personalization engine keyed by email; returns user recommendations, clusters, preferences.

**Use in Agent Hub:** Suggest agent types, personalize interactions, self-improvement.

**Integration Points:**
- **Bootstrap profile**: Create/load user profile by email
- **Agent suggestions**: Recommend agent templates based on preferences
- **Feedback learning**: Update profile from thumbs up/down
- **Preference tracking**: Track topics, tone, agent type preferences
- **Self-improvement**: Analyze feedback patterns and evolve

**Data Model:**
```javascript
{
  "user_email": "user@example.com",
  "preferences": {
    "preferred_agent_templates": [
      { "id": "research_scout", "score": 0.9 },
      { "id": "task_planner", "score": 0.6 }
    ],
    "topics": { "ai": 0.8, "productivity": 0.7 },
    "tone": "concise"
  }
}
```

---

## Daft

**Docs:** https://docs.daft.ai/en/stable/quickstart/

**What it does:** ETL + embedding + vectorization tooling.

**Use in Agent Hub:** Optional for offline embedding/vector operations.

**Integration Points:**
- Optional: Vector search for agent matching
- Optional: Semantic similarity for feedback clustering
- Optional: Document processing

---

## Linkup

**Link:** https://linkup-platform.notion.site/Get-Started-With-Linkup-1fa161ecef6980d49422f5871d8d24c0?pvs=74

**What it does:** Real-time data API for live search, news, signals.

**Use in Agent Hub:** Research agents call Linkup for real-time info.

**Integration Points:**
- **Real-time search**: Research Scout agent searches web
- **Source URLs**: Display search sources in chat
- **Live data**: News, trends, current information
- **Visible demo**: Show "Searching web with Linkup..." indicator

**Example Usage:**
```javascript
const linkup = new LinkupClient({ apiKey: LINKUP_API_KEY });
const results = await linkup.search({
  query: "latest AI agent developments",
  depth: "standard"
});
```

---

## mcptotal.io

**Link:** https://mcptotal.io

**What it does:** Deploy/host MCP servers; manage multiple micro-agents.

**Use in Agent Hub:** Host the MCP agents built by Raindrop + FrontMCP.

**Integration Points:**
- **Deploy MCP servers**: Host FrontMCP-built servers
- **Manage agents**: Dashboard for all micro-agents
- **Demo visibility**: Show mcptotal dashboard in presentation
- **Server registry**: Track agent instances

**MCP Servers to Deploy:**
1. Research Scout (Linkup search)
2. Task Planner (task decomposition)
3. Study Coach (concept explanation)

---

## FrontMCP

**What it does:** TypeScript decorators to define MCP tools for micro-agents; export as MCP servers.

**Use in Agent Hub:** Define agent tools with @mcptool decorators, deploy to mcptotal.

**Integration Points:**
- **Tool definitions**: Create MCP tools with decorators
- **Agent capabilities**: searchWeb, querySenso, createTodo, etc.
- **MCP server export**: Auto-generate MCP servers
- **Local dev**: Run MCP servers locally (stdio)
- **Cloud deploy**: Deploy to mcptotal.io

**Example Usage:**
```typescript
import { mcptool } from 'frontmcp';

class ResearchScoutMCP {
  @mcptool("Search web with Linkup for real-time information")
  async searchWeb(query: string) {
    const linkup = new LinkupClient({ apiKey: LINKUP_API_KEY });
    const results = await linkup.search({ query });
    return {
      results: results.data,
      source_urls: results.data.map(r => r.url)
    };
  }

  @mcptool("Store context in Senso for long-term memory")
  async storeContext(data: any) {
    // Senso integration
  }
}
```

---

## Freepik Hackathon Repos

**Repo 1:** https://github.com/freepik-company/ai-agents-hackathon
Starter agent examples.

**Repo 2:** https://github.com/freepik-company/freepik-api-nodes
Node.js SDK for Freepik.

---

## Tool Integration Summary

### Critical Path (Must Have)
1. **Fastino** - Personalization (profile, suggestions, learning)
2. **Linkup** - Real-time search (visible in demo)
3. **FrontMCP** - MCP server architecture (code walkthrough)
4. **Raindrop** - Data layer/API (built in IDE)
5. **Freepik** - Avatar images (visual appeal)

### High Value (Should Have)
6. **mcptotal** - MCP server hosting (impressive dashboard)
7. **Airia** - Orchestration (optional)

### Optional (Nice to Have)
8. **Senso** - Memory storage (if time permits)
9. **Daft** - Vector operations (advanced features)
10. **AgentFront** - Additional routing (if needed)

---

## API Keys Needed

Before building, obtain API keys for:

- [ ] Fastino API key
- [ ] Linkup API key
- [ ] Airia API key (optional)
- [ ] Raindrop account + API key
- [ ] FrontMCP setup
- [ ] mcptotal account
- [ ] Freepik API key
- [ ] Senso API key (optional)

Store in `.env` files:
```bash
# Backend
FASTINO_API_KEY=xxx
LINKUP_API_KEY=xxx
AIRIA_API_KEY=xxx
RAINDROP_API_KEY=xxx
FREEPIK_API_KEY=xxx
SENSO_API_KEY=xxx
MCPTOTAL_API_KEY=xxx
```

---

## Prize Track Strategy

### Maximum Prize Potential
Focus integration efforts on tools with prize tracks:
1. Demonstrate Fastino personalization prominently
2. Show Linkup search in action with source URLs
3. Code walkthrough of FrontMCP decorators
4. Screenshot mcptotal dashboard
5. Display Freepik avatars on all agent cards

### Demo Checklist
- [ ] Fastino profile JSON shown before/after feedback
- [ ] Linkup "Searching web..." indicator visible
- [ ] mcptotal dashboard with active servers
- [ ] FrontMCP @mcptool code snippet
- [ ] Freepik avatars on agent cards
- [ ] Raindrop smart blocks demo (if time)
- [ ] Airia orchestration dashboard (if time)
- [ ] Senso context logs (if time)

---

## Quick Links Reference

| Tool | Primary Link | Documentation |
|------|-------------|---------------|
| Senso | https://docs.senso.ai | Schema-safe context |
| Airia | https://api.airia.ai/docs | Agent orchestration |
| Raindrop | https://liquidmetal.ai/ | Smart building blocks |
| AgentFront | https://docs.agentfront.dev | Workflow hosting |
| Freepik | https://www.freepik.com/api | Image API |
| Fastino | https://fastino.ai/personalization | Hyper-personalization |
| Daft | https://docs.daft.ai | ETL + vectors |
| Linkup | https://linkup-platform.notion.site | Real-time search |
| mcptotal | https://mcptotal.io | MCP hosting |

---

**Last Updated:** 2025-01-15
