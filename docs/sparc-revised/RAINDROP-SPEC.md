# Raindrop (LiquidMetal) Specification for Agent Hub
## Complete Build Guide for Raindrop IDE

**Timeline:** Hour 1-3 (parallel with other agents)
**Owner:** Agent 3 (Raindrop Agent)
**Integration:** REST API consumed by Backend Agent

---

## 1. Overview

Build the **entire data and API layer** in Raindrop IDE using LiquidMetal blocks. This replaces traditional database + ORM setup with visual, declarative blocks that auto-generate REST APIs.

**What Raindrop Provides:**
- Visual data modeling (tables/collections)
- Auto-generated REST API endpoints
- Built-in authentication/authorization
- Real-time subscriptions (optional)
- Automatic validation and indexing

---

## 2. Data Models (LiquidMetal Blocks)

### 2.1 Users Collection

**Block Type:** `Data Model`
**Collection Name:** `users`

**Fields:**
```yaml
email:
  type: string
  required: true
  unique: true
  index: true
  validation: email

display_name:
  type: string
  required: false
  default: ""

created_at:
  type: timestamp
  auto: true
  default: now()

profile_last_updated:
  type: timestamp
  auto: true
  onUpdate: now()

fastino_profile:
  type: json
  required: false
  default: {}
  # Stores: { preferred_agents, topics, tone }

active_session:
  type: string
  required: false
  # Session token for quick auth
```

**Indexes:**
- Primary: email
- Secondary: created_at (for analytics)

---

### 2.2 AgentTemplates Collection

**Block Type:** `Data Model`
**Collection Name:** `agent_templates`

**Fields:**
```yaml
template_id:
  type: string
  required: true
  unique: true
  primary: true

name:
  type: string
  required: true

description:
  type: string
  required: true

category:
  type: string
  enum: [research, planning, creative, productivity, learning]
  required: true

default_tools:
  type: array
  items: string
  default: []
  # e.g., ["linkup", "senso"]

base_prompt:
  type: text
  required: true

avatar_url:
  type: string
  required: false
  # Freepik API URL

is_active:
  type: boolean
  default: true

created_at:
  type: timestamp
  auto: true
```

**Pre-populated Data (seed 5 templates):**
```json
[
  {
    "template_id": "research_scout",
    "name": "Research Scout",
    "description": "Monitors topics & fetches live info from the web",
    "category": "research",
    "default_tools": ["linkup"],
    "base_prompt": "You are a research assistant specializing in real-time information gathering. Use Linkup to search the web and provide accurate, up-to-date answers with citations.",
    "is_active": true
  },
  {
    "template_id": "task_planner",
    "name": "Task Planner",
    "description": "Breaks down goals into actionable steps",
    "category": "planning",
    "default_tools": ["senso"],
    "base_prompt": "You are a productivity assistant that helps users break down complex goals into structured, actionable tasks. Store plans in memory using Senso.",
    "is_active": true
  },
  {
    "template_id": "study_coach",
    "name": "Study Coach",
    "description": "Personalized learning companion",
    "category": "learning",
    "default_tools": ["linkup", "senso"],
    "base_prompt": "You are an educational assistant that creates personalized learning paths. Use Linkup to find resources and Senso to track progress.",
    "is_active": true
  },
  {
    "template_id": "creative_writer",
    "name": "Creative Writer",
    "description": "Brainstorm ideas and draft content",
    "category": "creative",
    "default_tools": [],
    "base_prompt": "You are a creative writing assistant that helps users brainstorm ideas, develop narratives, and refine their writing.",
    "is_active": true
  },
  {
    "template_id": "code_helper",
    "name": "Code Helper",
    "description": "Debug and explain code concepts",
    "category": "productivity",
    "default_tools": ["linkup"],
    "base_prompt": "You are a coding assistant that helps debug issues, explains concepts, and finds documentation using Linkup for up-to-date API references.",
    "is_active": true
  }
]
```

---

### 2.3 AgentInstances Collection

**Block Type:** `Data Model`
**Collection Name:** `agent_instances`

**Fields:**
```yaml
instance_id:
  type: string
  required: true
  unique: true
  primary: true
  auto: uuid

user_email:
  type: string
  required: true
  index: true
  reference: users.email

template_id:
  type: string
  required: true
  reference: agent_templates.template_id

created_at:
  type: timestamp
  auto: true

config:
  type: json
  default: {}
  # Stores: { airia_agentcard_id, mcp_server_id, extra_prefs }

is_active:
  type: boolean
  default: true

last_interaction:
  type: timestamp
  required: false
```

**Indexes:**
- Primary: instance_id
- Composite: (user_email, template_id) for quick lookups

---

### 2.4 Messages Collection

**Block Type:** `Data Model`
**Collection Name:** `messages`

**Fields:**
```yaml
message_id:
  type: string
  required: true
  unique: true
  primary: true
  auto: uuid

agent_instance_id:
  type: string
  required: true
  index: true
  reference: agent_instances.instance_id

user_email:
  type: string
  required: true
  index: true

role:
  type: string
  enum: [user, assistant]
  required: true

text:
  type: text
  required: true

created_at:
  type: timestamp
  auto: true
  index: true

metadata:
  type: json
  default: {}
  # Stores: { tools_used, source_urls, latency_ms }
```

**Indexes:**
- Primary: message_id
- Composite: (agent_instance_id, created_at) for chat history pagination

---

### 2.5 Feedback Collection

**Block Type:** `Data Model`
**Collection Name:** `feedback`

**Fields:**
```yaml
feedback_id:
  type: string
  required: true
  unique: true
  primary: true
  auto: uuid

message_id:
  type: string
  required: true
  reference: messages.message_id

agent_instance_id:
  type: string
  required: true
  index: true

user_email:
  type: string
  required: true
  index: true

label:
  type: string
  enum: [up, down]
  required: true

created_at:
  type: timestamp
  auto: true

processed:
  type: boolean
  default: false
  # For self-improvement cycle tracking
```

---

## 3. API Endpoints (Auto-Generated)

Raindrop will auto-generate these REST endpoints. **Backend Agent** will consume them.

### 3.1 User Endpoints

**POST /api/users**
```json
// Create/login user
{
  "email": "user@example.com",
  "display_name": "John Doe"
}
```

**GET /api/users/:email**
```json
// Get user profile
{
  "email": "user@example.com",
  "display_name": "John Doe",
  "created_at": "2025-11-15T10:00:00Z",
  "fastino_profile": { /* ... */ }
}
```

**PATCH /api/users/:email**
```json
// Update Fastino profile
{
  "fastino_profile": {
    "preferred_agents": [
      { "id": "research_scout", "score": 0.9 }
    ],
    "topics": { "ai": 0.8 },
    "tone": "concise"
  }
}
```

---

### 3.2 Agent Template Endpoints

**GET /api/agent_templates**
```json
// Get all active templates
[
  {
    "template_id": "research_scout",
    "name": "Research Scout",
    "description": "...",
    "category": "research",
    "default_tools": ["linkup"],
    "avatar_url": "https://..."
  }
]
```

**GET /api/agent_templates/:template_id**
```json
// Get specific template
{
  "template_id": "research_scout",
  "name": "Research Scout",
  "base_prompt": "...",
  "default_tools": ["linkup"]
}
```

---

### 3.3 Agent Instance Endpoints

**POST /api/agent_instances**
```json
// Create new agent instance
{
  "user_email": "user@example.com",
  "template_id": "research_scout",
  "config": {
    "mcp_server_id": "optional",
    "extra_prefs": {}
  }
}

// Response:
{
  "instance_id": "uuid-123",
  "user_email": "user@example.com",
  "template_id": "research_scout",
  "created_at": "2025-11-15T10:05:00Z"
}
```

**GET /api/agent_instances?user_email=...**
```json
// Get all instances for user
[
  {
    "instance_id": "uuid-123",
    "template_id": "research_scout",
    "created_at": "2025-11-15T10:05:00Z",
    "is_active": true
  }
]
```

**DELETE /api/agent_instances/:instance_id**
```json
// Soft delete (set is_active=false)
{
  "success": true
}
```

---

### 3.4 Message Endpoints

**POST /api/messages**
```json
// Store new message
{
  "agent_instance_id": "uuid-123",
  "user_email": "user@example.com",
  "role": "user",
  "text": "What's the latest on AI safety?",
  "metadata": {}
}

// Response:
{
  "message_id": "msg-456",
  "created_at": "2025-11-15T10:10:00Z"
}
```

**GET /api/messages?agent_instance_id=...&limit=50**
```json
// Get chat history
[
  {
    "message_id": "msg-456",
    "role": "user",
    "text": "...",
    "created_at": "2025-11-15T10:10:00Z",
    "metadata": {}
  }
]
```

---

### 3.5 Feedback Endpoints

**POST /api/feedback**
```json
// Store feedback
{
  "message_id": "msg-456",
  "agent_instance_id": "uuid-123",
  "user_email": "user@example.com",
  "label": "up"
}

// Response:
{
  "feedback_id": "fb-789",
  "created_at": "2025-11-15T10:12:00Z"
}
```

**GET /api/feedback?user_email=...&processed=false**
```json
// Get unprocessed feedback for self-improvement
[
  {
    "feedback_id": "fb-789",
    "message_id": "msg-456",
    "label": "up",
    "created_at": "2025-11-15T10:12:00Z"
  }
]
```

**PATCH /api/feedback/:feedback_id**
```json
// Mark feedback as processed
{
  "processed": true
}
```

---

## 4. LiquidMetal Smart Blocks

### 4.1 Personalization Block

**Block Type:** `Custom Logic`
**Name:** `suggest_agents`
**Trigger:** HTTP endpoint

**Input:**
```json
{
  "user_email": "user@example.com",
  "limit": 3
}
```

**Logic:**
```javascript
// Fetch user profile
const user = await db.users.findOne({ email: input.user_email });

// If user has Fastino profile, use scores
if (user.fastino_profile && user.fastino_profile.preferred_agents) {
  const scored = user.fastino_profile.preferred_agents
    .sort((a, b) => b.score - a.score)
    .slice(0, input.limit);

  // Fetch full templates
  const templates = await db.agent_templates.findMany({
    template_id: { $in: scored.map(s => s.id) }
  });

  return templates;
}

// Fallback: return top 3 by category diversity
const templates = await db.agent_templates.findMany({
  is_active: true,
  limit: input.limit
});

return templates;
```

**Output:**
```json
[
  { "template_id": "research_scout", "name": "...", "..." },
  { "template_id": "task_planner", "name": "...", "..." }
]
```

**Endpoint:** `POST /api/blocks/suggest_agents`

---

### 4.2 Self-Improvement Block

**Block Type:** `Custom Logic`
**Name:** `improve_profile`
**Trigger:** Scheduled (every 5 min) or manual

**Input:**
```json
{
  "user_email": "user@example.com"
}
```

**Logic:**
```javascript
// Fetch unprocessed feedback
const feedback = await db.feedback.findMany({
  user_email: input.user_email,
  processed: false
});

if (feedback.length === 0) return { updated: false };

// Count positive/negative by template
const stats = {};
for (const fb of feedback) {
  const msg = await db.messages.findOne({ message_id: fb.message_id });
  const inst = await db.agent_instances.findOne({ instance_id: msg.agent_instance_id });

  if (!stats[inst.template_id]) {
    stats[inst.template_id] = { up: 0, down: 0 };
  }

  if (fb.label === 'up') stats[inst.template_id].up++;
  else stats[inst.template_id].down++;
}

// Update scores
const user = await db.users.findOne({ email: input.user_email });
const profile = user.fastino_profile || { preferred_agents: [] };

for (const [template_id, counts] of Object.entries(stats)) {
  const existing = profile.preferred_agents.find(a => a.id === template_id);
  const score = (counts.up - counts.down) / (counts.up + counts.down);

  if (existing) {
    existing.score = (existing.score * 0.8) + (score * 0.2); // Weighted average
  } else {
    profile.preferred_agents.push({ id: template_id, score });
  }
}

// Update user profile
await db.users.updateOne(
  { email: input.user_email },
  { fastino_profile: profile, profile_last_updated: new Date() }
);

// Mark feedback as processed
await db.feedback.updateMany(
  { user_email: input.user_email, processed: false },
  { processed: true }
);

return { updated: true, profile };
```

**Output:**
```json
{
  "updated": true,
  "profile": {
    "preferred_agents": [
      { "id": "research_scout", "score": 0.85 },
      { "id": "task_planner", "score": 0.6 }
    ]
  }
}
```

**Endpoint:** `POST /api/blocks/improve_profile`

---

### 4.3 Analytics Block

**Block Type:** `Custom Logic`
**Name:** `user_analytics`

**Input:**
```json
{
  "user_email": "user@example.com"
}
```

**Logic:**
```javascript
const instances = await db.agent_instances.countDocuments({ user_email: input.user_email });
const messages = await db.messages.countDocuments({ user_email: input.user_email });
const feedback_up = await db.feedback.countDocuments({ user_email: input.user_email, label: 'up' });
const feedback_down = await db.feedback.countDocuments({ user_email: input.user_email, label: 'down' });

return {
  total_agents_created: instances,
  total_messages: messages,
  satisfaction_rate: feedback_up / (feedback_up + feedback_down) || 0
};
```

**Endpoint:** `GET /api/blocks/user_analytics?user_email=...`

---

## 5. Implementation Checklist (Raindrop Agent)

### Hour 1 (Setup + Core Models)
- [ ] Create Raindrop project: "AgentHub-Data"
- [ ] Define Users collection with fields + indexes
- [ ] Define AgentTemplates collection
- [ ] Seed 5 agent templates
- [ ] Define AgentInstances collection
- [ ] Test auto-generated CRUD endpoints

### Hour 2 (Messages + Smart Blocks)
- [ ] Define Messages collection with pagination
- [ ] Define Feedback collection
- [ ] Create `suggest_agents` smart block
- [ ] Create `improve_profile` smart block
- [ ] Create `user_analytics` block
- [ ] Test all custom endpoints

### Hour 3 (Integration + Docs)
- [ ] Deploy Raindrop project (get API base URL)
- [ ] Share API URL + endpoints with Backend Agent
- [ ] Test end-to-end: create user → create instance → send message
- [ ] Document authentication (if needed)
- [ ] Create Postman/Insomnia collection for testing

---

## 6. Integration with Backend

**Backend Agent** will:
1. Use Raindrop API as primary database
2. Wrap Raindrop endpoints in `/api/*` routes
3. Add business logic (Fastino, Linkup, Airia calls)
4. Handle authentication tokens

**Example Backend Route:**
```typescript
// Backend: POST /api/agents/instances
app.post('/api/agents/instances', async (req, res) => {
  const { user_email, template_id } = req.body;

  // 1. Call Raindrop to create instance
  const raindropRes = await axios.post(`${RAINDROP_API}/api/agent_instances`, {
    user_email,
    template_id,
    config: {}
  });

  const instance = raindropRes.data;

  // 2. Optionally deploy MCP server (FrontMCP)
  const mcpServerId = await deployMCPServer(instance);

  // 3. Update instance config in Raindrop
  await axios.patch(`${RAINDROP_API}/api/agent_instances/${instance.instance_id}`, {
    config: { mcp_server_id: mcpServerId }
  });

  res.json(instance);
});
```

---

## 7. Authentication Strategy

**Option A: Simple (Recommended for hackathon)**
- Raindrop API is public (or uses API key)
- Backend handles user sessions
- Backend validates requests before calling Raindrop

**Option B: Raindrop Auth**
- Enable Raindrop's built-in auth
- Backend forwards user tokens
- Raindrop enforces row-level security

**Recommendation:** Use Option A for speed.

---

## 8. Deployment

**Raindrop IDE:**
1. Click "Deploy" in Raindrop interface
2. Get production API URL: `https://your-project.raindrop.run`
3. Share URL with Backend Agent via memory:

```bash
npx claude-flow@alpha hooks post-edit \
  --file "raindrop-deployment" \
  --memory-key "swarm/raindrop/api-url" \
  --value "https://your-project.raindrop.run"
```

**Environment Variables for Backend:**
```env
RAINDROP_API_URL=https://your-project.raindrop.run
RAINDROP_API_KEY=optional-if-needed
```

---

## 9. Success Criteria

- [ ] All 5 collections deployed and accessible
- [ ] Auto-generated CRUD endpoints working
- [ ] 3 smart blocks deployed and tested
- [ ] Seed data loaded (5 agent templates)
- [ ] API URL shared with Backend Agent
- [ ] End-to-end test: user creation → chat → feedback
- [ ] Performance: <200ms response times

---

## 10. Coordination with Other Agents

**Share via Memory:**
```bash
# After deployment
npx claude-flow@alpha hooks post-edit \
  --file "raindrop-api" \
  --memory-key "swarm/raindrop/endpoints" \
  --value "{
    \"base_url\": \"https://your-project.raindrop.run\",
    \"users\": \"/api/users\",
    \"templates\": \"/api/agent_templates\",
    \"instances\": \"/api/agent_instances\",
    \"messages\": \"/api/messages\",
    \"feedback\": \"/api/feedback\",
    \"suggest_agents\": \"/api/blocks/suggest_agents\",
    \"improve_profile\": \"/api/blocks/improve_profile\"
  }"
```

**Backend Agent reads:**
```bash
npx claude-flow@alpha hooks session-restore --session-id "swarm-agent-hub"
# Memory will contain Raindrop API details
```

---

## Notes for Raindrop Agent

1. **Speed First:** Use Raindrop's visual editor for rapid prototyping
2. **Test as You Go:** Use built-in API testing in Raindrop IDE
3. **Share Early:** Deploy after Hour 1 so Backend can integrate
4. **Document:** Keep endpoint specs updated for Backend Agent
5. **Monitor:** Use Raindrop's logs to debug integration issues
