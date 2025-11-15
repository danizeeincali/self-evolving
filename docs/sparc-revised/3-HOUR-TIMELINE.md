# 3-Hour Timeline — Agent Hub Build
## Minute-by-Minute Parallel Execution Plan

**Total Duration:** 180 Minutes (3 Hours)
**Agents:** 3 (Frontend, Backend, Raindrop)
**Coordination:** Claude Flow hooks + shared memory
**Goal:** Working demo with all 8 sponsor tools integrated

---

## Hour 1: Foundation & Setup (60 Minutes)

### Minutes 0-10: Project Initialization

**All Agents (Parallel):**
```bash
# Solo developer spawns all 3 agents via Claude Code Task tool
Task("Raindrop Agent", "...", "code-analyzer")
Task("Backend Agent", "...", "backend-dev")
Task("Frontend Agent", "...", "coder")

# All agents restore session
npx claude-flow@alpha hooks session-restore --session-id "swarm-agent-hub"
```

**Raindrop Agent:**
- [ ] Create new Raindrop project: "AgentHub-Data"
- [ ] Review RAINDROP-SPEC.md
- [ ] Plan data model structure

**Backend Agent:**
- [ ] `mkdir app/backend && cd app/backend`
- [ ] `npm init -y && npm install express typescript @types/node axios dotenv`
- [ ] Create `tsconfig.json`, `src/index.ts`
- [ ] Setup Express server scaffold

**Frontend Agent:**
- [ ] `npm create vite@latest app/frontend -- --template react-ts`
- [ ] `cd app/frontend && npm install axios tailwindcss @headlessui/react`
- [ ] Setup Tailwind config
- [ ] Create component structure: `src/components/{Login, AgentCard, Chat}`

---

### Minutes 10-30: Core Data & API Setup

**Raindrop Agent:**
- [ ] Define **Users** collection (email, display_name, fastino_profile, created_at)
- [ ] Define **AgentTemplates** collection (template_id, name, description, category, default_tools, base_prompt, avatar_url)
- [ ] Seed 5 agent templates:
  - research_scout
  - task_planner
  - study_coach
  - creative_writer
  - code_helper
- [ ] Test auto-generated endpoints in Raindrop UI

**Backend Agent:**
- [ ] Install sponsor SDKs:
  ```bash
  npm install @fastino/sdk @linkup/sdk @airia/sdk frontmcp
  ```
- [ ] Create environment template (`.env.example`):
  ```env
  RAINDROP_API_URL=TBD
  FASTINO_API_KEY=your_key
  LINKUP_API_KEY=your_key
  FREEPIK_API_KEY=your_key
  SENSO_API_KEY=optional
  PORT=3000
  ```
- [ ] Create API route stubs:
  ```typescript
  // src/routes/auth.ts
  router.post('/login', loginHandler);

  // src/routes/agents.ts
  router.get('/agents/suggestions', getSuggestions);
  router.post('/agents/instances', createInstance);

  // src/routes/chat.ts
  router.post('/chat/send', sendMessage);
  router.get('/chat/history', getHistory);

  // src/routes/feedback.ts
  router.post('/feedback', submitFeedback);
  router.post('/self_improve', triggerImprovement);
  ```

**Frontend Agent:**
- [ ] Create **Login.tsx** component:
  ```typescript
  // Email input + submit button
  // On submit: POST /api/login
  // Store user email in localStorage
  ```
- [ ] Create **AgentCard.tsx** component:
  ```typescript
  // Props: name, description, avatar_url
  // Displays Freepik image
  // "Create & Chat" button
  ```
- [ ] Create basic routing (login → main app)

---

### Minutes 30-50: Integration Points

**Raindrop Agent:**
- [ ] Define **AgentInstances** collection (instance_id, user_email, template_id, config, created_at, is_active)
- [ ] Add composite index: (user_email, template_id)
- [ ] **Deploy Raindrop project** 🚀
- [ ] Get API URL: `https://agent-hub-xyz.raindrop.run`
- [ ] **Share via memory:**
  ```bash
  npx claude-flow@alpha hooks post-edit \
    --file "raindrop-deployment" \
    --memory-key "swarm/raindrop/api-url" \
    --value "https://agent-hub-xyz.raindrop.run"

  npx claude-flow@alpha hooks notify \
    --message "Raindrop deployed! API available at https://agent-hub-xyz.raindrop.run"
  ```

**Backend Agent:**
- [ ] Wait for Raindrop notification (hooks)
- [ ] Retrieve Raindrop URL from memory
- [ ] Update `.env`: `RAINDROP_API_URL=https://agent-hub-xyz.raindrop.run`
- [ ] Test Raindrop connection:
  ```typescript
  // Test: GET /api/agent_templates
  // Verify 5 templates returned
  ```
- [ ] Implement **Fastino integration** (login handler):
  ```typescript
  import Fastino from '@fastino/sdk';

  async function loginHandler(req, res) {
    const { email } = req.body;

    // 1. Create/fetch user in Raindrop
    let user = await raindrop.get(`/api/users/${email}`);
    if (!user) {
      user = await raindrop.post('/api/users', { email });
    }

    // 2. Initialize Fastino profile
    const profile = await fastino.getOrCreateProfile(email);

    // 3. Update user in Raindrop
    await raindrop.patch(`/api/users/${email}`, {
      fastino_profile: profile
    });

    res.json({ user, session_token: generateToken(email) });
  }
  ```

**Frontend Agent:**
- [ ] Wait for backend API notification (hooks)
- [ ] Connect Login component to backend:
  ```typescript
  const handleLogin = async (email) => {
    const res = await axios.post('http://localhost:3000/api/login', { email });
    localStorage.setItem('user_email', email);
    localStorage.setItem('session_token', res.data.session_token);
    navigate('/app');
  };
  ```
- [ ] Create **Freepik integration** utility:
  ```typescript
  // src/utils/freepik.ts
  export async function getAgentAvatar(category: string) {
    const res = await axios.get('https://api.freepik.com/v1/resources', {
      params: { query: `${category} avatar cartoon`, limit: 1 },
      headers: { 'x-api-key': FREEPIK_API_KEY }
    });
    return res.data.data[0].image.source.url;
  }
  ```

---

### Minutes 50-60: Checkpoint 1 — Basic Flow Test

**All Agents (Parallel):**
- [ ] **Raindrop:** Verify deployment, test endpoints
- [ ] **Backend:** Test login flow (Fastino integration working)
- [ ] **Frontend:** Test login UI → main app routing

**Integration Test:**
1. Frontend: Enter email → click login
2. Backend: Calls Fastino, creates user in Raindrop
3. Verify: User appears in Raindrop dashboard

**Memory Update:**
```bash
# Backend shares API contracts
npx claude-flow@alpha hooks post-edit \
  --memory-key "swarm/backend/status" \
  --value "login-endpoint-working"
```

---

## Hour 2: Core Features & Integration (60 Minutes)

### Minutes 60-80: Agent Suggestions & Chat Setup

**Raindrop Agent:**
- [ ] Define **Messages** collection (message_id, agent_instance_id, user_email, role, text, created_at, metadata)
- [ ] Define **Feedback** collection (feedback_id, message_id, label, created_at, processed)
- [ ] Create **suggest_agents** smart block (see RAINDROP-SPEC.md)
- [ ] Test: `POST /api/blocks/suggest_agents` with test user

**Backend Agent:**
- [ ] Implement `GET /api/agents/suggestions`:
  ```typescript
  async function getSuggestions(req, res) {
    const { user_email } = req.query;

    // Call Raindrop smart block
    const suggestions = await raindrop.post('/api/blocks/suggest_agents', {
      user_email,
      limit: 3
    });

    // Enhance with Freepik avatars
    for (const agent of suggestions) {
      if (!agent.avatar_url) {
        agent.avatar_url = await getFreepikAvatar(agent.category);
      }
    }

    res.json(suggestions);
  }
  ```
- [ ] Implement `POST /api/agents/instances`:
  ```typescript
  async function createInstance(req, res) {
    const { user_email, template_id } = req.body;

    // Create in Raindrop
    const instance = await raindrop.post('/api/agent_instances', {
      user_email,
      template_id,
      config: {}
    });

    // TODO: Deploy MCP server (FrontMCP) — next section

    res.json(instance);
  }
  ```

**Frontend Agent:**
- [ ] Create **AgentSuggestions.tsx** component:
  ```typescript
  // Fetches GET /api/agents/suggestions
  // Displays grid of AgentCard components
  // Each card shows Freepik avatar
  ```
- [ ] Create **Chat.tsx** component:
  ```typescript
  // Message list + input box
  // Send button → POST /api/chat/send
  // Thumbs up/down buttons on assistant messages
  ```
- [ ] Wire up "Create & Chat" button:
  ```typescript
  const handleCreateAgent = async (template_id) => {
    const res = await axios.post('/api/agents/instances', {
      user_email: localStorage.getItem('user_email'),
      template_id
    });
    setActiveAgent(res.data.instance_id);
  };
  ```

---

### Minutes 80-100: MCP Server & Linkup Integration

**Raindrop Agent:**
- [ ] Create **improve_profile** smart block (see RAINDROP-SPEC.md)
- [ ] Test self-improvement logic:
  - Create test feedback (thumbs up/down)
  - Trigger block
  - Verify user profile scores updated
- [ ] Create **user_analytics** block (optional bonus)

**Backend Agent:**
- [ ] **FrontMCP Integration** — Define MCP tools:
  ```typescript
  // src/mcp/tools.ts
  import { mcptool } from 'frontmcp';

  @mcptool("Search the web for real-time information")
  async function searchWeb(query: string) {
    const linkup = new LinkupSDK(process.env.LINKUP_API_KEY);
    const results = await linkup.search(query);
    return results;
  }

  @mcptool("Store context in memory")
  async function storeContext(key: string, value: any) {
    const senso = new SensoSDK(process.env.SENSO_API_KEY);
    await senso.store({ key, value, namespace: 'agent-hub' });
    return { success: true };
  }
  ```
- [ ] Deploy MCP server:
  ```typescript
  import { deployToMcptotal } from 'frontmcp';

  async function deployMCPServer(instance_id: string, tools: string[]) {
    const mcpConfig = {
      name: `agent-${instance_id}`,
      tools: tools.map(t => require(`./mcp/tools/${t}`))
    };

    const deployment = await deployToMcptotal(mcpConfig);
    return deployment.server_id;
  }
  ```
- [ ] Update `POST /api/agents/instances` to deploy MCP server
- [ ] Implement `POST /api/chat/send`:
  ```typescript
  async function sendMessage(req, res) {
    const { agent_instance_id, text } = req.body;

    // 1. Save user message to Raindrop
    await raindrop.post('/api/messages', {
      agent_instance_id,
      user_email: req.user.email,
      role: 'user',
      text
    });

    // 2. Load agent instance + template
    const instance = await raindrop.get(`/api/agent_instances/${agent_instance_id}`);
    const template = await raindrop.get(`/api/agent_templates/${instance.template_id}`);

    // 3. Call Airia agent (or direct MCP)
    let reply;
    if (template.default_tools.includes('linkup')) {
      // Use Linkup for research agents
      const linkup = new LinkupSDK(process.env.LINKUP_API_KEY);
      const searchResults = await linkup.search(text);

      // Generate response using Airia
      const airia = new AiriaSDK(process.env.AIRIA_API_KEY);
      reply = await airia.chat({
        messages: [
          { role: 'system', content: template.base_prompt },
          { role: 'user', content: text },
          { role: 'system', content: `Search results: ${JSON.stringify(searchResults)}` }
        ]
      });
    } else {
      // Simple Airia call
      const airia = new AiriaSDK(process.env.AIRIA_API_KEY);
      reply = await airia.chat({
        messages: [
          { role: 'system', content: template.base_prompt },
          { role: 'user', content: text }
        ]
      });
    }

    // 4. Save assistant message
    await raindrop.post('/api/messages', {
      agent_instance_id,
      user_email: req.user.email,
      role: 'assistant',
      text: reply.content,
      metadata: { tools_used: ['linkup'], latency_ms: reply.latency }
    });

    res.json({ reply: reply.content });
  }
  ```

**Frontend Agent:**
- [ ] Implement chat message display:
  ```typescript
  // Chat.tsx
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Load chat history
    axios.get(`/api/chat/history?agent_instance_id=${activeAgent}`)
      .then(res => setMessages(res.data));
  }, [activeAgent]);

  const sendMessage = async (text) => {
    // Optimistic update
    setMessages([...messages, { role: 'user', text }]);

    // Send to backend
    const res = await axios.post('/api/chat/send', {
      agent_instance_id: activeAgent,
      text
    });

    // Add assistant reply
    setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
  };
  ```
- [ ] Add feedback buttons:
  ```typescript
  const handleFeedback = async (message_id, label) => {
    await axios.post('/api/feedback', {
      message_id,
      agent_instance_id: activeAgent,
      label // 'up' or 'down'
    });

    // Visual feedback
    toast.success(`Feedback recorded!`);
  };
  ```

---

### Minutes 100-120: Checkpoint 2 — Full Flow Test

**Integration Test (All Agents):**
1. **Login:** Enter email → Fastino profile created
2. **Suggestions:** See 3 personalized agent cards (Freepik avatars)
3. **Create Agent:** Click Research Scout → MCP server deployed to mcptotal
4. **Chat:** Send "What's the latest on AI safety?" → Linkup searches web → agent responds
5. **Feedback:** Click thumbs up → feedback stored in Raindrop

**Verification:**
- [ ] Check mcptotal dashboard (MCP server visible)
- [ ] Check Raindrop dashboard (user, instance, messages, feedback all present)
- [ ] Check backend logs (Fastino, Linkup API calls visible)

**Memory Update:**
```bash
npx claude-flow@alpha hooks post-edit \
  --memory-key "swarm/integration/checkpoint-2" \
  --value "full-flow-working"
```

---

## Hour 3: Polish & Demo Prep (60 Minutes)

### Minutes 120-140: Self-Improvement & Analytics

**Raindrop Agent:**
- [ ] Optimize database queries (add missing indexes)
- [ ] Test `improve_profile` block with real feedback data
- [ ] Create Postman collection for all endpoints
- [ ] Export API documentation

**Backend Agent:**
- [ ] Implement `GET /api/chat/history`:
  ```typescript
  async function getHistory(req, res) {
    const { agent_instance_id, limit = 50 } = req.query;

    const messages = await raindrop.get('/api/messages', {
      params: { agent_instance_id, limit }
    });

    res.json(messages);
  }
  ```
- [ ] Implement `POST /api/feedback`:
  ```typescript
  async function submitFeedback(req, res) {
    const { message_id, agent_instance_id, label } = req.body;

    const feedback = await raindrop.post('/api/feedback', {
      message_id,
      agent_instance_id,
      user_email: req.user.email,
      label
    });

    res.json(feedback);
  }
  ```
- [ ] Implement `POST /api/self_improve`:
  ```typescript
  async function triggerImprovement(req, res) {
    const { user_email } = req.body;

    // Call Raindrop smart block
    const result = await raindrop.post('/api/blocks/improve_profile', {
      user_email
    });

    // Optionally: Call Fastino to update profile externally
    if (result.updated) {
      await fastino.updateProfile(user_email, result.profile);
    }

    res.json(result);
  }
  ```

**Frontend Agent:**
- [ ] Polish UI with TailwindCSS:
  - Login view: centered card, gradient background
  - Agent cards: hover effects, shadows
  - Chat: message bubbles (user right, assistant left)
  - Feedback buttons: animated thumbs icons
- [ ] Add loading states:
  ```typescript
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    setLoading(true);
    // ... API call
    setLoading(false);
  };
  ```
- [ ] Add error handling:
  ```typescript
  try {
    await axios.post('/api/chat/send', { ... });
  } catch (error) {
    toast.error('Failed to send message');
  }
  ```

---

### Minutes 140-160: Deployment & Testing

**Raindrop Agent:**
- [ ] Final deployment check (production URL stable)
- [ ] Run smoke tests (all endpoints responding <200ms)
- [ ] Document environment setup for judges

**Backend Agent:**
- [ ] Deploy to Railway/Render:
  ```bash
  # railway.json
  {
    "build": { "command": "npm run build" },
    "start": { "command": "npm start" },
    "env": {
      "RAINDROP_API_URL": "https://agent-hub-xyz.raindrop.run",
      "FASTINO_API_KEY": "$FASTINO_API_KEY",
      "LINKUP_API_KEY": "$LINKUP_API_KEY",
      "FREEPIK_API_KEY": "$FREEPIK_API_KEY"
    }
  }
  ```
- [ ] Update frontend with production API URL
- [ ] Test deployed backend with Postman

**Frontend Agent:**
- [ ] Deploy to Vercel:
  ```bash
  # vercel.json
  {
    "env": {
      "VITE_API_URL": "https://agent-hub-backend.railway.app/api"
    }
  }
  ```
- [ ] Test deployed frontend (end-to-end flow)
- [ ] Take screenshots for demo

---

### Minutes 160-180: Demo Script & Final Checks

**All Agents (Final Coordination):**
- [ ] **Raindrop:** Seed fresh demo data (clean database)
- [ ] **Backend:** Restart server, verify all API keys loaded
- [ ] **Frontend:** Clear localStorage, test from scratch

**Demo Preparation:**
1. Create demo user: `demo@agenthub.com`
2. Pre-seed Fastino profile (prefers "research" agents)
3. Clear chat history for clean demo
4. Prepare 3 demo queries:
   - "What's the latest on AI safety?" (Linkup integration)
   - "Break down learning React into steps" (Task Planner)
   - "Explain quantum computing" (Study Coach)

**Demo Script (3 Minutes):**

**[0:00-0:30] Login & Personalization**
- Show login view → enter `demo@agenthub.com`
- Backend calls Fastino (show logs: `[Fastino] Loading profile for demo@agenthub.com`)
- Suggestions appear: Research Scout (top), Task Planner, Study Coach
- Point out Freepik avatars

**[0:30-1:30] Agent Creation & Chat**
- Click "Create & Chat" on Research Scout
- Backend deploys MCP server (show mcptotal dashboard in browser tab)
- Chat window opens
- Type: "What's the latest on AI safety?"
- Show Linkup API call in backend logs
- Agent responds with citations
- Click thumbs up

**[1:30-2:30] Self-Improvement**
- Click "Improve Profile" button (triggers `POST /api/self_improve`)
- Backend logs: `[Raindrop] Running improve_profile block`
- Show Raindrop dashboard (feedback processed, score updated)
- Refresh suggestions → Research Scout now 0.95 score (was 0.85)

**[2:30-3:00] Sponsor Tool Summary**
- Show slide with 8 sponsor logos:
  1. ✅ Fastino (personalization profile)
  2. ✅ Linkup (real-time web search)
  3. ✅ Airia (agent orchestration)
  4. ✅ Raindrop (data layer + smart blocks)
  5. ✅ FrontMCP (MCP server creation)
  6. ✅ mcptotal (MCP hosting)
  7. ✅ Freepik (agent avatars)
  8. ✅ Senso (optional context storage — bonus if implemented)
- Thank judges, invite questions

---

## Contingency Plans

### If Running Behind Schedule

**Priority Tiers:**
1. **Must Have (Tier 1):**
   - Login (Fastino)
   - Agent suggestions (Raindrop + Freepik)
   - Chat with Linkup (Backend)
   - Basic UI (Frontend)

2. **Should Have (Tier 2):**
   - MCP server deployment (FrontMCP + mcptotal)
   - Feedback system
   - Self-improvement cycle

3. **Nice to Have (Tier 3):**
   - Senso integration
   - Advanced analytics
   - UI polish

**If 30 minutes behind:**
- Drop Tier 3
- Simplify MCP deployment (local only, skip mcptotal)

**If 60 minutes behind:**
- Drop Tier 2 self-improvement
- Focus on core demo flow (Tier 1 only)

---

## Success Metrics (End of 3 Hours)

### Functional Requirements
- [ ] User can log in with email
- [ ] Fastino profile created/loaded
- [ ] 3+ agent suggestions displayed
- [ ] Freepik avatars visible
- [ ] User can create agent instance
- [ ] Chat interface functional
- [ ] Linkup integration working (research agents)
- [ ] Feedback buttons functional
- [ ] Self-improvement cycle updates profile

### Technical Requirements
- [ ] Raindrop deployed (production URL)
- [ ] Backend deployed (Railway/Render)
- [ ] Frontend deployed (Vercel)
- [ ] MCP server on mcptotal (or local demo)
- [ ] All 8 sponsor tools used
- [ ] <1s response times for chat

### Demo Requirements
- [ ] 3-minute script prepared
- [ ] Clean demo data seeded
- [ ] Screenshots captured
- [ ] GitHub repos public
- [ ] README with setup instructions

---

## Post-Build Checklist

**Documentation:**
- [ ] README.md with sponsor tool usage
- [ ] API documentation (Postman collection)
- [ ] Architecture diagram
- [ ] Demo video (optional but strong)

**Code Quality:**
- [ ] Git repos organized (frontend, backend)
- [ ] Environment variables documented
- [ ] No hardcoded API keys
- [ ] Basic error handling

**Demo Polish:**
- [ ] Clean UI (no debug logs in console)
- [ ] Fast load times
- [ ] Mobile-responsive (bonus points)
- [ ] Accessibility (ARIA labels, bonus)

---

## Final Coordination Commands

**End of Hour 3:**
```bash
# All agents mark complete
npx claude-flow@alpha hooks post-task --task-id "agent-hub-build"

# Export session metrics
npx claude-flow@alpha hooks session-end --export-metrics true

# Generate summary
npx claude-flow@alpha swarm status --verbose
```

**Memory Export (for demo):**
```bash
# Export all coordination data
npx claude-flow@alpha hooks session-restore \
  --session-id "swarm-agent-hub" \
  --export-file "demo/coordination-log.json"
```

---

**Total Time Investment:** 3 hours (180 minutes)
**Expected Outcome:** Working demo with all 8 sponsor tools, ready for hackathon submission
**Risk Level:** Medium (tight timeline, multiple integrations)
**Mitigation:** Parallel execution, clear priorities, contingency plans

🚀 **LET'S BUILD!**
