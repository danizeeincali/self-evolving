# Agent Hub - Quick Start Guide

## 🚀 Hackathon Speed Setup (2 Hours to Working Demo)

This guide gets you from zero to working demo in **2 hours**. Follow step-by-step, no shortcuts.

---

## Prerequisites (5 minutes)

### Required Tools
- [ ] Node.js 20+ installed
- [ ] npm or yarn
- [ ] Git
- [ ] VS Code (or preferred editor)
- [ ] Modern browser (Chrome/Firefox)

### Required API Keys
Get these API keys BEFORE you start:

1. **Fastino** - [Get API key from hackathon organizers]
2. **Linkup** - [Get API key from hackathon organizers]
3. **Airia** - [Get API key from hackathon organizers]
4. **Raindrop** - [Get API key from hackathon organizers]
5. **FrontMCP** - [Get API key from hackathon organizers]
6. **mcptotal** - [Get API key from hackathon organizers]
7. **Freepik** - [Get API key from hackathon organizers]
8. **Senso** - [Get API key from hackathon organizers]

**⚠️ CRITICAL**: Test each API key works BEFORE building anything!

```bash
# Test script - create test-apis.js
const testAPIs = async () => {
  // Test Fastino
  const fastinoResponse = await fetch('https://api.fastino.ai/test', {
    headers: { 'Authorization': `Bearer ${FASTINO_KEY}` }
  });
  console.log('Fastino:', fastinoResponse.ok ? '✅' : '❌');

  // Repeat for all 8 APIs...
};

node test-apis.js
```

---

## HOUR 1: Backend Foundation (60 minutes)

### Step 1: Project Setup (10 minutes)

```bash
# Create project structure
mkdir agent-hub
cd agent-hub

# Create subdirectories
mkdir -p backend/src/{routes,services,mcp,data,utils}
mkdir -p frontend/src/{components,services}
mkdir -p docs

# Initialize backend
cd backend
npm init -y

# Install dependencies (all at once)
npm install express cors dotenv axios
npm install typescript @types/node @types/express ts-node nodemon --save-dev
npm install @fastino/sdk @linkup/sdk @airia/sdk @raindrop/liquidmetal frontmcp @mcptotal/client @freepik/sdk @senso/sdk

# Create tsconfig.json
npx tsc --init

# Go back to root
cd ..
```

**Configure TypeScript** (`backend/tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**Create `.env`** (`backend/.env`):
```bash
PORT=3000
NODE_ENV=development

FASTINO_API_KEY=your_fastino_key_here
LINKUP_API_KEY=your_linkup_key_here
AIRIA_API_KEY=your_airia_key_here
RAINDROP_API_KEY=your_raindrop_key_here
FRONTMCP_API_KEY=your_frontmcp_key_here
MCPTOTAL_API_KEY=your_mcptotal_key_here
FREEPIK_API_KEY=your_freepik_key_here
SENSO_API_KEY=your_senso_key_here
```

### Step 2: Create Data Store (10 minutes)

**Create** `backend/src/data/store.ts`:
```typescript
// In-memory JSON store (hackathon speed)
interface User {
  email: string;
  created_at: string;
  display_name?: string;
}

interface Session {
  id: string;
  user_email: string;
  created_at: string;
  expires_at: string;
}

interface AgentInstance {
  id: string;
  user_email: string;
  template_id: string;
  name: string;
  created_at: string;
  config: any;
  status: 'active' | 'archived';
}

interface Message {
  id: string;
  agent_instance_id: string;
  role: 'user' | 'assistant';
  text: string;
  created_at: string;
  metadata: any;
}

interface Feedback {
  id: string;
  message_id: string;
  agent_instance_id: string;
  user_email: string;
  label: 'up' | 'down';
  created_at: string;
}

class InMemoryStore {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private agentInstances: Map<string, AgentInstance> = new Map();
  private messages: Map<string, Message> = new Map();
  private feedback: Map<string, Feedback> = new Map();

  // User operations
  createUser(email: string): User {
    const user: User = {
      email,
      created_at: new Date().toISOString()
    };
    this.users.set(email, user);
    return user;
  }

  getUser(email: string): User | undefined {
    return this.users.get(email);
  }

  // Session operations
  createSession(user_email: string): Session {
    const session: Session = {
      id: `sess_${Math.random().toString(36).substr(2, 9)}`,
      user_email,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(session_id: string): Session | undefined {
    return this.sessions.get(session_id);
  }

  // Agent instance operations
  createAgentInstance(data: Omit<AgentInstance, 'id' | 'created_at' | 'status'>): AgentInstance {
    const instance: AgentInstance = {
      ...data,
      id: `agent_inst_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    this.agentInstances.set(instance.id, instance);
    return instance;
  }

  getAgentInstance(id: string): AgentInstance | undefined {
    return this.agentInstances.get(id);
  }

  getUserAgentInstances(user_email: string): AgentInstance[] {
    return Array.from(this.agentInstances.values())
      .filter(inst => inst.user_email === user_email && inst.status === 'active');
  }

  // Message operations
  createMessage(data: Omit<Message, 'id' | 'created_at'>): Message {
    const message: Message = {
      ...data,
      id: `msg_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    this.messages.set(message.id, message);
    return message;
  }

  getMessage(id: string): Message | undefined {
    return this.messages.get(id);
  }

  getAgentMessages(agent_instance_id: string, limit: number = 50): Message[] {
    return Array.from(this.messages.values())
      .filter(msg => msg.agent_instance_id === agent_instance_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-limit);
  }

  // Feedback operations
  createFeedback(data: Omit<Feedback, 'id' | 'created_at'>): Feedback {
    const fb: Feedback = {
      ...data,
      id: `fb_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    this.feedback.set(fb.id, fb);
    return fb;
  }

  getUserFeedback(user_email: string, since?: Date): Feedback[] {
    let feedbacks = Array.from(this.feedback.values())
      .filter(fb => fb.user_email === user_email);

    if (since) {
      feedbacks = feedbacks.filter(fb =>
        new Date(fb.created_at) > since
      );
    }

    return feedbacks;
  }
}

export const store = new InMemoryStore();
```

### Step 3: Agent Templates (5 minutes)

**Create** `backend/src/data/templates.ts`:
```typescript
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  avatar_query: string;
  base_prompt: string;
  default_tools: string[];
  capabilities: string[];
}

export const AGENT_TEMPLATES: Record<string, AgentTemplate> = {
  research_scout: {
    id: 'research_scout',
    name: 'Research Scout',
    description: 'Monitors topics and fetches live info from the web using Linkup.',
    avatar_query: 'robot scout futuristic blue',
    base_prompt: 'You are a research assistant that uses real-time web search to provide up-to-date information. Always cite sources.',
    default_tools: ['linkup', 'senso'],
    capabilities: [
      'Real-time web search',
      'Topic monitoring',
      'Source verification'
    ]
  },
  task_planner: {
    id: 'task_planner',
    name: 'Task Planner',
    description: 'Helps you organize tasks and manage your schedule.',
    avatar_query: 'robot planner calendar purple',
    base_prompt: 'You are a task planning assistant that helps users break down goals and create actionable plans.',
    default_tools: ['senso'],
    capabilities: [
      'Task breakdown',
      'Priority scoring',
      'Schedule optimization'
    ]
  },
  study_coach: {
    id: 'study_coach',
    name: 'Study Coach',
    description: 'Personalized learning assistant with adaptive teaching.',
    avatar_query: 'robot teacher friendly green',
    base_prompt: 'You are a learning coach that adapts explanations to the user\'s level and provides practice problems.',
    default_tools: ['linkup', 'senso'],
    capabilities: [
      'Concept explanation',
      'Practice problems',
      'Progress tracking'
    ]
  }
};
```

### Step 4: Sponsor SDK Wrappers (15 minutes)

**Create** `backend/src/services/fastino.ts`:
```typescript
import axios from 'axios';

const FASTINO_API_URL = 'https://api.fastino.ai/v1';
const API_KEY = process.env.FASTINO_API_KEY;

export interface UserProfile {
  user_email: string;
  updated_at: string;
  preferences: {
    agent_types: Record<string, number>;
    topics: Record<string, number>;
    tone: string;
  };
}

export const fastino = {
  async createOrGetProfile(email: string): Promise<UserProfile> {
    try {
      const response = await axios.post(
        `${FASTINO_API_URL}/profiles`,
        { user_id: email },
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );
      return response.data;
    } catch (error) {
      // Fallback for demo
      return {
        user_email: email,
        updated_at: new Date().toISOString(),
        preferences: {
          agent_types: {
            research_scout: 0.8,
            task_planner: 0.6,
            study_coach: 0.5
          },
          topics: {},
          tone: 'balanced'
        }
      };
    }
  },

  async recordEvent(email: string, event: any): Promise<void> {
    try {
      await axios.post(
        `${FASTINO_API_URL}/events`,
        { user_id: email, event },
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );
    } catch (error) {
      console.error('Fastino event recording failed:', error);
    }
  },

  async analyzePatterns(email: string, options: any): Promise<any> {
    try {
      const response = await axios.post(
        `${FASTINO_API_URL}/analyze`,
        { user_id: email, ...options },
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );
      return response.data;
    } catch (error) {
      // Mock analysis for demo
      return {
        agent_preferences: { research_scout: 0.85 },
        detected_topics: { ai_agents: 0.9 },
        preferred_tone: 'technical'
      };
    }
  },

  async updateProfile(email: string, updates: any): Promise<UserProfile> {
    try {
      const response = await axios.patch(
        `${FASTINO_API_URL}/profiles/${email}`,
        updates,
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Fastino profile update failed:', error);
      throw error;
    }
  }
};
```

**Create** `backend/src/services/linkup.ts`:
```typescript
import axios from 'axios';

const LINKUP_API_URL = 'https://api.linkup.so/v1';
const API_KEY = process.env.LINKUP_API_KEY;

export const linkup = {
  async search(options: {
    query: string;
    limit?: number;
    freshness?: 'recent' | 'all';
  }): Promise<any[]> {
    try {
      const response = await axios.post(
        `${LINKUP_API_URL}/search`,
        {
          query: options.query,
          limit: options.limit || 5,
          freshness: options.freshness || 'recent'
        },
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );
      return response.data.results;
    } catch (error) {
      console.error('Linkup search failed:', error);
      // Fallback mock data
      return [
        {
          title: 'Example Result',
          url: 'https://example.com',
          snippet: 'Mock data - Linkup API unavailable'
        }
      ];
    }
  }
};
```

**Copy similar pattern for:**
- `backend/src/services/airia.ts`
- `backend/src/services/raindrop.ts`
- `backend/src/services/frontmcp.ts`
- `backend/src/services/mcptotal.ts`
- `backend/src/services/freepik.ts`
- `backend/src/services/senso.ts`

### Step 5: Express Server (10 minutes)

**Create** `backend/src/server.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (we'll add these next)
// app.use('/api/auth', authRoutes);
// app.use('/api/agents', agentRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/feedback', feedbackRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
```

### Step 6: API Routes (10 minutes)

**Create** `backend/src/routes/auth.ts`:
```typescript
import { Router } from 'express';
import { store } from '../data/store';
import { fastino } from '../services/fastino';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        error: { code: 'INVALID_REQUEST', message: 'Valid email required' }
      });
    }

    // Create or get user
    let user = store.getUser(email);
    const is_new_user = !user;

    if (!user) {
      user = store.createUser(email);
    }

    // Get Fastino profile
    const profile = await fastino.createOrGetProfile(email);

    // Create session
    const session = store.createSession(email);

    res.json({
      session_id: session.id,
      user,
      profile,
      is_new_user
    });
  } catch (error) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

export default router;
```

**Wire up in server.ts:**
```typescript
import authRoutes from './routes/auth';
app.use('/api', authRoutes);
```

**Test it:**
```bash
cd backend
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## HOUR 2: Frontend + Integration (60 minutes)

### Step 7: Frontend Setup (15 minutes)

```bash
cd frontend

# Create React app with Vite
npm create vite@latest . -- --template react-ts
npm install
npm install axios @tanstack/react-query lucide-react

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Configure Tailwind** (`frontend/tailwind.config.js`):
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Add to** `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 8: API Client (5 minutes)

**Create** `frontend/src/services/api.ts`:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add session interceptor
api.interceptors.request.use(config => {
  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

export const authAPI = {
  login: (email: string) => api.post('/api/login', { email })
};

export const agentsAPI = {
  getSuggestions: () => api.get('/api/agents/suggestions'),
  createInstance: (template_id: string) => api.post('/api/agents/instances', { template_id }),
  listInstances: () => api.get('/api/agents/instances')
};

export const chatAPI = {
  getHistory: (agent_instance_id: string) =>
    api.get('/api/chat/history', { params: { agent_instance_id } }),
  sendMessage: (agent_instance_id: string, message: string) =>
    api.post('/api/chat/send', { agent_instance_id, message })
};

export const feedbackAPI = {
  submit: (message_id: string, label: 'up' | 'down') =>
    api.post('/api/feedback', { message_id, label })
};
```

### Step 9: Core Components (25 minutes)

This is the most time-consuming part. Create these components:

1. `LoginView.tsx` - Email input form
2. `AgentCard.tsx` - Agent display card with avatar
3. `AgentGrid.tsx` - Grid of suggested agents
4. `ChatView.tsx` - Chat interface
5. `MessageList.tsx` - Message display
6. `FeedbackButtons.tsx` - Thumbs up/down

**Example** `frontend/src/components/LoginView.tsx`:
```typescript
import { useState } from 'react';
import { authAPI } from '../services/api';

export function LoginView({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email);
      localStorage.setItem('session_id', response.data.session_id);
      localStorage.setItem('user_email', email);
      onLogin();
    } catch (error) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Hub</h1>
        <p className="text-gray-600 mb-6">Self-evolving AI agents that learn from you</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border rounded-lg mb-4"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Step 10: Main App (10 minutes)

**Create** `frontend/src/App.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { LoginView } from './components/LoginView';
import { AgentGrid } from './components/AgentGrid';
import { ChatView } from './components/ChatView';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  if (selectedAgent) {
    return (
      <ChatView
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Agent Hub</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Suggested Agents</h2>
        <AgentGrid onSelectAgent={setSelectedAgent} />
      </main>
    </div>
  );
}

export default App;
```

### Step 11: Test Full Flow (5 minutes)

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit http://localhost:5173 and test:
1. Login with email
2. See suggested agents
3. Click an agent
4. Send a message
5. See response

---

## Next Steps (If Time Remains)

### Priority 1: Add Remaining API Endpoints
- Complete agents/suggestions route
- Complete agents/instances route
- Complete chat/send route with Linkup
- Complete feedback route with Fastino

### Priority 2: Polish UI
- Add loading spinners
- Add error messages
- Improve styling
- Add Freepik avatars

### Priority 3: Deploy
- Deploy backend to Railway/Render
- Deploy frontend to Vercel
- Test production

### Priority 4: Demo Prep
- Record backup video
- Create presentation slides
- Practice demo flow
- Test all sponsor integrations

---

## Troubleshooting

**Problem: API keys don't work**
- Solution: Use mock data, focus on UI and flow

**Problem: npm install fails**
- Solution: Delete node_modules, package-lock.json, retry

**Problem: CORS errors**
- Solution: Check backend has `app.use(cors())`

**Problem: Frontend can't reach backend**
- Solution: Check VITE_API_BASE_URL matches backend port

**Problem: Out of time**
- Solution: Cut optional features, focus on core flow + 3 sponsor tools (Fastino, Linkup, FrontMCP)

---

## Minimum Viable Demo

If you're running out of time, ensure these work:

1. ✅ Email login (even if just localStorage)
2. ✅ 3 agent cards displayed (hardcoded is fine)
3. ✅ Click agent opens chat
4. ✅ Send message shows response (mock is fine)
5. ✅ Show "Powered by Fastino/Linkup/FrontMCP" banners

Everything else is optional!

Good luck! 🚀
