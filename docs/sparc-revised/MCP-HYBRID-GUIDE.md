# MCP Hybrid Strategy Guide
## FrontMCP + mcptotal.io Integration for Agent Hub

**Goal:** Deploy micro-agent MCP servers with minimal friction
**Approach:** Hybrid local + cloud deployment
**Tools:** FrontMCP (TypeScript decorators) + mcptotal.io (hosting platform)

---

## 1. Overview

### Why Hybrid?

**Local Development (FrontMCP):**
- Fast iteration during hackathon
- Full control over agent logic
- TypeScript type safety
- Easy debugging

**Cloud Deployment (mcptotal.io):**
- Persistent MCP servers
- Public URLs for demo
- Managed infrastructure
- Impressive for judges (visible dashboard)

**Hybrid Strategy:**
- Develop locally with FrontMCP
- Deploy to mcptotal for demo
- Fallback to local if cloud issues

---

## 2. FrontMCP Setup (Backend Agent)

### Installation

```bash
cd app/backend
npm install frontmcp @modelcontextprotocol/sdk
```

### Project Structure

```
app/backend/
├── src/
│   ├── mcp/
│   │   ├── tools/          # MCP tool definitions
│   │   │   ├── linkup.ts   # Linkup search tool
│   │   │   ├── senso.ts    # Senso memory tool
│   │   │   └── index.ts    # Export all tools
│   │   ├── server.ts       # MCP server setup
│   │   └── deploy.ts       # mcptotal deployment logic
│   ├── routes/
│   ├── index.ts
│   └── config.ts
├── package.json
└── tsconfig.json
```

---

## 3. Define MCP Tools (FrontMCP Decorators)

### Tool 1: Linkup Web Search

**File:** `src/mcp/tools/linkup.ts`

```typescript
import { mcptool } from 'frontmcp';
import { LinkupSDK } from '@linkup/sdk';

const linkup = new LinkupSDK(process.env.LINKUP_API_KEY!);

@mcptool({
  name: 'search_web',
  description: 'Search the web for real-time information using Linkup',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query'
      },
      depth: {
        type: 'string',
        enum: ['basic', 'standard', 'deep'],
        description: 'Search depth (default: standard)',
        default: 'standard'
      }
    },
    required: ['query']
  }
})
export async function searchWeb({ query, depth = 'standard' }: { query: string; depth?: string }) {
  try {
    const results = await linkup.search({
      query,
      depth: depth as any,
      outputType: 'searchResults'
    });

    return {
      success: true,
      results: results.results.slice(0, 5).map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.slice(0, 200)
      })),
      sources: results.results.map((r: any) => r.url)
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

### Tool 2: Senso Memory Storage

**File:** `src/mcp/tools/senso.ts`

```typescript
import { mcptool } from 'frontmcp';
import { SensoSDK } from '@senso/sdk'; // Hypothetical SDK

const senso = new SensoSDK(process.env.SENSO_API_KEY!);

@mcptool({
  name: 'store_context',
  description: 'Store context/memory using Senso for long-term recall',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'Unique key for the context'
      },
      value: {
        type: 'object',
        description: 'The context data to store'
      },
      ttl: {
        type: 'number',
        description: 'Time-to-live in seconds (optional)',
        default: 86400 // 24 hours
      }
    },
    required: ['key', 'value']
  }
})
export async function storeContext({ key, value, ttl = 86400 }: { key: string; value: any; ttl?: number }) {
  try {
    await senso.store({
      namespace: 'agent-hub',
      key,
      value,
      ttl
    });

    return { success: true, key };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

@mcptool({
  name: 'retrieve_context',
  description: 'Retrieve previously stored context from Senso',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'The key to retrieve'
      }
    },
    required: ['key']
  }
})
export async function retrieveContext({ key }: { key: string }) {
  try {
    const value = await senso.retrieve({
      namespace: 'agent-hub',
      key
    });

    return { success: true, value };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

---

### Tool 3: Agent State Management

**File:** `src/mcp/tools/state.ts`

```typescript
import { mcptool } from 'frontmcp';
import axios from 'axios';

const RAINDROP_API = process.env.RAINDROP_API_URL!;

@mcptool({
  name: 'update_agent_config',
  description: 'Update agent instance configuration in Raindrop',
  parameters: {
    type: 'object',
    properties: {
      instance_id: { type: 'string' },
      config: { type: 'object' }
    },
    required: ['instance_id', 'config']
  }
})
export async function updateAgentConfig({ instance_id, config }: { instance_id: string; config: any }) {
  try {
    await axios.patch(`${RAINDROP_API}/api/agent_instances/${instance_id}`, {
      config
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

---

### Export All Tools

**File:** `src/mcp/tools/index.ts`

```typescript
export * from './linkup';
export * from './senso';
export * from './state';
```

---

## 4. Create MCP Server (FrontMCP)

**File:** `src/mcp/server.ts`

```typescript
import { createMCPServer } from 'frontmcp';
import * as tools from './tools';

export function createAgentMCPServer(agentInstanceId: string, enabledTools: string[]) {
  // Filter tools based on agent template configuration
  const toolFunctions = Object.entries(tools)
    .filter(([name]) => enabledTools.includes(name))
    .map(([_, fn]) => fn);

  const server = createMCPServer({
    name: `agent-${agentInstanceId}`,
    version: '1.0.0',
    description: `MCP server for agent instance ${agentInstanceId}`,
    tools: toolFunctions,
    capabilities: {
      tools: true,
      prompts: false,
      resources: false
    }
  });

  return server;
}
```

---

## 5. Local MCP Server (Development Mode)

**File:** `src/mcp/local.ts`

```typescript
import { createAgentMCPServer } from './server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

/**
 * Run MCP server locally via stdio (for testing)
 * Usage: node dist/mcp/local.js <instance_id> <tools>
 */
async function runLocalServer() {
  const [instanceId, toolsArg] = process.argv.slice(2);
  const tools = toolsArg ? toolsArg.split(',') : ['search_web', 'store_context'];

  const server = createAgentMCPServer(instanceId, tools);
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error(`MCP server running for agent ${instanceId} with tools: ${tools.join(', ')}`);
}

runLocalServer().catch(console.error);
```

**Test locally:**
```bash
# Terminal 1: Start MCP server
node dist/mcp/local.js test-agent-123 search_web,store_context

# Terminal 2: Test with MCP inspector
npx @modelcontextprotocol/inspector stdio node dist/mcp/local.js test-agent-123 search_web
```

---

## 6. Deploy to mcptotal.io

### Option A: Manual Deployment (Fastest)

**Step 1:** Bundle MCP server
```bash
# Create standalone bundle
npm run build
tar -czf mcp-agent-server.tar.gz dist/ package.json
```

**Step 2:** Upload to mcptotal.io
1. Go to https://mcptotal.io/deploy
2. Upload `mcp-agent-server.tar.gz`
3. Configure:
   - **Name:** `agent-{instance_id}`
   - **Entry:** `node dist/mcp/local.js {instance_id} {tools}`
   - **Environment:**
     ```
     LINKUP_API_KEY=...
     SENSO_API_KEY=...
     RAINDROP_API_URL=...
     ```
4. Click "Deploy"
5. Get server URL: `https://agent-123.mcptotal.io`

---

### Option B: Automated Deployment (Recommended)

**File:** `src/mcp/deploy.ts`

```typescript
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import archiver from 'archiver';

const MCPTOTAL_API = 'https://api.mcptotal.io/v1';
const MCPTOTAL_API_KEY = process.env.MCPTOTAL_API_KEY!;

/**
 * Deploy MCP server to mcptotal.io
 */
export async function deployToMcptotal(instanceId: string, tools: string[]): Promise<string> {
  // 1. Create tarball
  const tarballPath = `/tmp/mcp-${instanceId}.tar.gz`;
  await createTarball(tarballPath);

  // 2. Upload to mcptotal
  const formData = new FormData();
  formData.append('file', fs.createReadStream(tarballPath));
  formData.append('name', `agent-${instanceId}`);
  formData.append('entry', `node dist/mcp/local.js ${instanceId} ${tools.join(',')}`);
  formData.append('env', JSON.stringify({
    LINKUP_API_KEY: process.env.LINKUP_API_KEY,
    SENSO_API_KEY: process.env.SENSO_API_KEY,
    RAINDROP_API_URL: process.env.RAINDROP_API_URL
  }));

  const response = await axios.post(`${MCPTOTAL_API}/servers`, formData, {
    headers: {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${MCPTOTAL_API_KEY}`
    }
  });

  // 3. Cleanup
  fs.unlinkSync(tarballPath);

  // 4. Return server ID and URL
  return response.data.server_id;
}

async function createTarball(outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('tar', { gzip: true });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory('dist/', 'dist');
    archive.file('package.json', { name: 'package.json' });
    archive.finalize();
  });
}
```

**Usage in agent creation:**
```typescript
// src/routes/agents.ts
import { deployToMcptotal } from '../mcp/deploy';

async function createInstance(req, res) {
  const { user_email, template_id } = req.body;

  // 1. Create instance in Raindrop
  const instance = await raindrop.post('/api/agent_instances', {
    user_email,
    template_id
  });

  // 2. Get template tools
  const template = await raindrop.get(`/api/agent_templates/${template_id}`);
  const tools = template.default_tools.map(toolNameToFunction);

  // 3. Deploy MCP server to mcptotal
  let mcpServerId;
  try {
    mcpServerId = await deployToMcptotal(instance.instance_id, tools);
  } catch (error) {
    console.error('mcptotal deployment failed, falling back to local:', error);
    // Fallback: run local MCP server
    mcpServerId = `local-${instance.instance_id}`;
  }

  // 4. Update instance config
  await raindrop.patch(`/api/agent_instances/${instance.instance_id}`, {
    config: { mcp_server_id: mcpServerId }
  });

  res.json({ ...instance, mcp_server_id: mcpServerId });
}

function toolNameToFunction(toolName: string): string {
  const mapping: Record<string, string> = {
    'linkup': 'search_web',
    'senso': 'store_context,retrieve_context'
  };
  return mapping[toolName] || '';
}
```

---

## 7. Airia Integration (Agent Orchestration)

### Setup Airia Agent Card

**File:** `src/airia/setup.ts`

```typescript
import { AiriaSDK } from '@airia/sdk';

const airia = new AiriaSDK(process.env.AIRIA_API_KEY!);

export async function createAiriaAgent(instanceId: string, mcpServerUrl: string, template: any) {
  const agentCard = await airia.createAgentCard({
    name: `Agent ${instanceId}`,
    description: template.description,
    basePrompt: template.base_prompt,
    mcpServers: [
      {
        url: mcpServerUrl,
        transport: 'http' // or 'stdio' for local
      }
    ],
    settings: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 2048
    }
  });

  return agentCard.id;
}
```

### Use Airia in Chat

**File:** `src/routes/chat.ts`

```typescript
import { AiriaSDK } from '@airia/sdk';

const airia = new AiriaSDK(process.env.AIRIA_API_KEY!);

async function sendMessage(req, res) {
  const { agent_instance_id, text } = req.body;

  // Load instance config (has Airia agent card ID)
  const instance = await raindrop.get(`/api/agent_instances/${agent_instance_id}`);
  const airiaAgentId = instance.config.airia_agentcard_id;

  // Send message to Airia agent (which calls MCP tools)
  const response = await airia.chat({
    agentCardId: airiaAgentId,
    messages: [
      { role: 'user', content: text }
    ]
  });

  // Save assistant message
  await raindrop.post('/api/messages', {
    agent_instance_id,
    user_email: req.user.email,
    role: 'assistant',
    text: response.content,
    metadata: {
      tools_used: response.toolsUsed,
      airia_request_id: response.requestId
    }
  });

  res.json({ reply: response.content });
}
```

---

## 8. Fallback Strategy (Local MCP)

**When to Use Local:**
- mcptotal.io deployment fails
- Hackathon WiFi issues
- Faster iteration during development

**Implementation:**

```typescript
// src/mcp/manager.ts
import { spawn, ChildProcess } from 'child_process';

const localServers: Map<string, ChildProcess> = new Map();

export function startLocalMCPServer(instanceId: string, tools: string[]): string {
  const proc = spawn('node', [
    'dist/mcp/local.js',
    instanceId,
    tools.join(',')
  ], {
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  localServers.set(instanceId, proc);

  return `local-${instanceId}`;
}

export function stopLocalMCPServer(instanceId: string) {
  const proc = localServers.get(instanceId);
  if (proc) {
    proc.kill();
    localServers.delete(instanceId);
  }
}
```

**Modified Agent Creation:**
```typescript
async function createInstance(req, res) {
  // ... create instance in Raindrop ...

  let mcpServerId;

  if (process.env.USE_LOCAL_MCP === 'true') {
    // Use local MCP server
    mcpServerId = startLocalMCPServer(instance.instance_id, tools);
  } else {
    // Try mcptotal deployment
    try {
      mcpServerId = await deployToMcptotal(instance.instance_id, tools);
    } catch (error) {
      console.warn('Falling back to local MCP');
      mcpServerId = startLocalMCPServer(instance.instance_id, tools);
    }
  }

  // ... update instance config ...
}
```

---

## 9. Demo Strategy

### Show Both Local & Cloud

**Demo Flow:**
1. **Create Agent 1:** Research Scout
   - Deploy to mcptotal.io
   - **Show mcptotal dashboard** (MCP server visible)
   - Chat with web search (Linkup tool called)

2. **Create Agent 2:** Task Planner
   - Use local MCP server (faster)
   - Show terminal with MCP server logs
   - Demonstrate tool calls in real-time

3. **Highlight Hybrid:**
   - Explain: "Production uses mcptotal, dev uses local"
   - Show code: deployment logic with fallback

---

## 10. Troubleshooting

### Issue: mcptotal.io Deployment Times Out

**Solution:**
```typescript
// Add timeout and retry logic
async function deployToMcptotal(instanceId: string, tools: string[], retries = 2): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        `${MCPTOTAL_API}/servers`,
        formData,
        { timeout: 30000 } // 30s timeout
      );
      return response.data.server_id;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
    }
  }
  throw new Error('Deployment failed after retries');
}
```

---

### Issue: Tools Not Available in MCP Server

**Solution:** Verify tool registration
```typescript
// Add debug logging
export function createAgentMCPServer(agentInstanceId: string, enabledTools: string[]) {
  const toolFunctions = Object.entries(tools)
    .filter(([name]) => {
      const included = enabledTools.includes(name);
      console.log(`Tool ${name}: ${included ? 'included' : 'excluded'}`);
      return included;
    })
    .map(([_, fn]) => fn);

  console.log(`Creating MCP server with ${toolFunctions.length} tools`);

  // ...
}
```

---

### Issue: Environment Variables Not Passed

**Solution:** Use .env file for local, config for mcptotal
```typescript
// src/config.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  linkupApiKey: process.env.LINKUP_API_KEY!,
  sensoApiKey: process.env.SENSO_API_KEY!,
  raindropApiUrl: process.env.RAINDROP_API_URL!,
  mcptotalApiKey: process.env.MCPTOTAL_API_KEY!
};

// Validate required keys
const required = ['LINKUP_API_KEY', 'RAINDROP_API_URL'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}
```

---

## 11. Integration Checklist

### Backend Agent Tasks
- [ ] Install FrontMCP: `npm install frontmcp`
- [ ] Define 3+ MCP tools (Linkup, Senso, State)
- [ ] Create MCP server setup function
- [ ] Implement local MCP server runner
- [ ] Implement mcptotal deployment function
- [ ] Add fallback logic (local if cloud fails)
- [ ] Integrate Airia SDK
- [ ] Test tool calls locally
- [ ] Test deployment to mcptotal
- [ ] Document environment variables

### Demo Preparation
- [ ] Get mcptotal.io API key
- [ ] Test deployment to mcptotal
- [ ] Prepare demo script (show both local + cloud)
- [ ] Take screenshots of mcptotal dashboard
- [ ] Document hybrid approach for judges

---

## 12. Success Criteria

- [ ] MCP servers deploy to mcptotal.io
- [ ] Linkup tool callable from agents
- [ ] Senso memory persistence working
- [ ] Airia orchestrates MCP tool calls
- [ ] Fallback to local MCP functional
- [ ] mcptotal dashboard shows active servers
- [ ] Demo flow smooth (no crashes)

---

## Appendix: Environment Variables

**Required:**
```env
# Core APIs
RAINDROP_API_URL=https://agent-hub-xyz.raindrop.run
FASTINO_API_KEY=your_fastino_key
LINKUP_API_KEY=your_linkup_key
FREEPIK_API_KEY=your_freepik_key

# MCP & Airia
MCPTOTAL_API_KEY=your_mcptotal_key
AIRIA_API_KEY=your_airia_key

# Optional
SENSO_API_KEY=your_senso_key
USE_LOCAL_MCP=false
```

**For mcptotal Deployment:**
- All keys above will be passed as environment variables
- mcptotal will inject them into MCP server runtime

---

**Total Setup Time:** ~40 minutes (within Hour 2 of 3-hour timeline)
**Deployment Time:** ~5 minutes per agent (mcptotal) or <1 minute (local)
**Risk Mitigation:** Fallback to local ensures demo works regardless of cloud issues

🚀 **Hybrid MCP = Best of Both Worlds!**
