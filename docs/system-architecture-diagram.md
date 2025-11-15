# Claude Flow + SPARC System Architecture

## 🎯 High-Level System Overview

```mermaid
graph TB
    subgraph "User Interface"
        USER[👤 User Request]
    end

    subgraph "Claude Code Layer"
        CC[Claude Code Assistant]
        TASK[Task Tool - Agent Spawner]
        TODO[TodoWrite - Task Management]
        FILES[File Operations: Read/Write/Edit]
        BASH[Bash - System Commands]
    end

    subgraph "MCP Coordination Layer (Optional)"
        MCP_INIT[swarm_init - Topology Setup]
        MCP_SPAWN[agent_spawn - Define Types]
        MCP_ORCH[task_orchestrate - High-level Planning]
        MCP_MEM[memory_usage - Context Sharing]
    end

    subgraph "Agent Execution"
        A1[🤖 Researcher Agent]
        A2[💻 Coder Agent]
        A3[🧪 Tester Agent]
        A4[👁️ Reviewer Agent]
        A5[🏗️ Architect Agent]
        A6[📊 Analyzer Agent]
    end

    subgraph "Coordination Hooks"
        PRE[pre-task hooks]
        DURING[post-edit hooks]
        POST[post-task hooks]
        SESSION[session management]
    end

    subgraph "Outputs"
        CODE[Source Code]
        TESTS[Test Files]
        DOCS[Documentation]
        CONFIG[Configuration]
    end

    USER --> CC
    CC --> TASK
    CC -.optional.-> MCP_INIT
    MCP_INIT -.coordinates.-> MCP_SPAWN
    MCP_SPAWN -.coordinates.-> MCP_ORCH

    TASK ==>|spawns concurrently| A1
    TASK ==>|spawns concurrently| A2
    TASK ==>|spawns concurrently| A3
    TASK ==>|spawns concurrently| A4
    TASK ==>|spawns concurrently| A5
    TASK ==>|spawns concurrently| A6

    A1 --> PRE
    A2 --> PRE
    A3 --> PRE
    PRE --> DURING
    DURING --> POST
    POST --> SESSION

    A1 --> CODE
    A2 --> CODE
    A3 --> TESTS
    A4 --> DOCS
    A5 --> CONFIG

    MCP_MEM -.shares context.-> A1
    MCP_MEM -.shares context.-> A2
    MCP_MEM -.shares context.-> A3
```

## 🔄 Complete Workflow: MCP Coordinates, Claude Code Executes

```mermaid
sequenceDiagram
    participant User
    participant Claude Code
    participant MCP Tools
    participant Task Tool
    participant Agents
    participant Hooks
    participant Output

    User->>Claude Code: Request Feature Implementation

    Note over Claude Code: Step 1: Optional Coordination Setup
    Claude Code->>MCP Tools: swarm_init(topology: "mesh")
    MCP Tools-->>Claude Code: Coordination topology ready

    Note over Claude Code: Step 2: Concurrent Agent Spawning
    Claude Code->>Task Tool: Spawn ALL agents in ONE message

    par Parallel Agent Execution
        Task Tool->>Agents: researcher agent
        Task Tool->>Agents: coder agent
        Task Tool->>Agents: tester agent
        Task Tool->>Agents: reviewer agent
    end

    Note over Agents: Each agent runs coordination protocol

    loop Agent Coordination Protocol
        Agents->>Hooks: pre-task (setup)
        Agents->>Hooks: session-restore (load context)
        Agents->>MCP Tools: Check memory for decisions
        Agents->>Hooks: post-edit (after each change)
        Agents->>Hooks: notify (progress updates)
        Agents->>Hooks: post-task (completion)
    end

    Agents->>Output: Generate code, tests, docs
    Output-->>User: Complete implementation
```

## 🎯 The Golden Rule: "1 Message = All Operations"

```mermaid
graph LR
    subgraph "❌ WRONG: Multiple Messages"
        M1[Message 1: Init MCP]
        M2[Message 2: Spawn Agent 1]
        M3[Message 3: Spawn Agent 2]
        M4[Message 4: Write Files]
        M1 --> M2 --> M3 --> M4
    end

    subgraph "✅ CORRECT: Single Message"
        SM[Single Message Contains:]
        SM --> OP1[MCP Init]
        SM --> OP2[ALL Agent Spawns]
        SM --> OP3[ALL TodoWrites]
        SM --> OP4[ALL File Operations]
    end

    style M1 fill:#ff6b6b
    style M2 fill:#ff6b6b
    style M3 fill:#ff6b6b
    style M4 fill:#ff6b6b
    style SM fill:#51cf66
```

## 📋 Agent Coordination Protocol (Every Agent Must Follow)

```mermaid
stateDiagram-v2
    [*] --> PreTask: Agent Spawned

    PreTask --> SessionRestore: Run pre-task hook
    SessionRestore --> LoadMemory: Restore session context
    LoadMemory --> Work: Load coordination memory

    state Work {
        [*] --> Implementation
        Implementation --> PostEdit: After each file change
        PostEdit --> Notify: Update memory
        Notify --> Implementation: Continue work
        Implementation --> [*]: Work complete
    }

    Work --> PostTask: All work done
    PostTask --> SessionEnd: Run post-task hook
    SessionEnd --> ExportMetrics: End session
    ExportMetrics --> [*]: Agent Complete

    note right of PreTask
        npx claude-flow hooks pre-task
        npx claude-flow hooks session-restore
    end note

    note right of PostEdit
        npx claude-flow hooks post-edit
        npx claude-flow hooks notify
    end note

    note right of PostTask
        npx claude-flow hooks post-task
        npx claude-flow hooks session-end
    end note
```

## 🏗️ SPARC Methodology Flow

```mermaid
graph TD
    START[User Request] --> SPEC[1️⃣ Specification Phase]
    SPEC --> |Requirements Analysis| PSEUDO[2️⃣ Pseudocode Phase]
    PSEUDO --> |Algorithm Design| ARCH[3️⃣ Architecture Phase]
    ARCH --> |System Design| REFINE[4️⃣ Refinement Phase]
    REFINE --> |TDD Implementation| COMPLETE[5️⃣ Completion Phase]

    subgraph "Specification"
        SPEC --> S1[Analyze Requirements]
        S1 --> S2[Define Constraints]
        S2 --> S3[Set Success Criteria]
    end

    subgraph "Pseudocode"
        PSEUDO --> P1[Design Algorithms]
        P1 --> P2[Plan Data Structures]
        P2 --> P3[Outline Logic Flow]
    end

    subgraph "Architecture"
        ARCH --> A1[Design System]
        A1 --> A2[Define Interfaces]
        A2 --> A3[Plan Integration]
    end

    subgraph "Refinement (TDD)"
        REFINE --> R1[Write Tests]
        R1 --> R2[Implement Code]
        R2 --> R3[Refactor]
        R3 --> R4{Tests Pass?}
        R4 -->|No| R1
        R4 -->|Yes| R5[Next Feature]
        R5 --> R1
    end

    subgraph "Completion"
        COMPLETE --> C1[Integration]
        C1 --> C2[Documentation]
        C2 --> C3[Final Review]
    end

    COMPLETE --> END[✅ Deployment Ready]
```

## 🚀 54 Available Agents by Category

```mermaid
mindmap
  root((54 Agents))
    Core Development
      coder
      reviewer
      tester
      planner
      researcher
    Swarm Coordination
      hierarchical-coordinator
      mesh-coordinator
      adaptive-coordinator
      collective-intelligence-coordinator
      swarm-memory-manager
    Consensus & Distributed
      byzantine-coordinator
      raft-manager
      gossip-coordinator
      crdt-synchronizer
      quorum-manager
      security-manager
    Performance
      perf-analyzer
      performance-benchmarker
      task-orchestrator
      memory-coordinator
    GitHub & Repository
      github-modes
      pr-manager
      code-review-swarm
      issue-tracker
      release-manager
      workflow-automation
    SPARC Methodology
      sparc-coord
      sparc-coder
      specification
      pseudocode
      architecture
      refinement
    Specialized
      backend-dev
      mobile-dev
      ml-developer
      cicd-engineer
      api-docs
      system-architect
```

## 📁 File Organization Structure

```mermaid
graph TD
    ROOT[Project Root] --> SRC[/src - Source Code]
    ROOT --> TESTS[/tests - Test Files]
    ROOT --> DOCS[/docs - Documentation]
    ROOT --> CONFIG[/config - Configuration]
    ROOT --> SCRIPTS[/scripts - Utility Scripts]
    ROOT --> EXAMPLES[/examples - Example Code]

    ROOT -.❌ NEVER save to root.-> WRONG[❌ Working files/tests]

    SRC --> S1[server.js]
    SRC --> S2[api/]
    SRC --> S3[models/]

    TESTS --> T1[unit/]
    TESTS --> T2[integration/]
    TESTS --> T3[e2e/]

    DOCS --> D1[API.md]
    DOCS --> D2[ARCHITECTURE.md]
    DOCS --> D3[diagrams/]

    style WRONG fill:#ff6b6b
    style ROOT fill:#51cf66
```

## 🎯 Claude Code vs MCP Tools Division

```mermaid
graph TB
    subgraph "Claude Code - EXECUTION Layer"
        CC_TASK[Task Tool: Spawn & Run Agents]
        CC_FILES[File Operations: Read/Write/Edit]
        CC_CODE[Code Generation]
        CC_BASH[Bash Commands]
        CC_TODO[TodoWrite: Task Management]
        CC_GIT[Git Operations]
        CC_TEST[Testing & Debugging]
    end

    subgraph "MCP Tools - COORDINATION Layer"
        MCP_INIT[swarm_init: Topology Setup]
        MCP_SPAWN[agent_spawn: Define Types]
        MCP_ORCH[task_orchestrate: Planning]
        MCP_MEM[memory_usage: Context]
        MCP_NEURAL[neural_*: Training]
        MCP_PERF[Performance Tracking]
        MCP_GH[GitHub Integration]
    end

    USER[👤 User Request] --> CC_TASK
    CC_TASK ==>|EXECUTES WORK| AGENTS[🤖 Real Agents]
    MCP_INIT -.coordinates.-> CC_TASK
    MCP_MEM -.shares context.-> AGENTS
    AGENTS --> OUTPUT[📦 Deliverables]

    style CC_TASK fill:#51cf66
    style MCP_INIT fill:#4dabf7
```

## 📊 Performance Benefits

```mermaid
graph LR
    subgraph "Traditional Approach"
        T1[Sequential Execution] --> T2[84.8% solve rate baseline]
        T2 --> T3[Standard token usage]
        T3 --> T4[1x speed]
    end

    subgraph "Claude Flow + SPARC"
        CF1[Concurrent Execution] --> CF2[84.8% solve rate maintained]
        CF2 --> CF3[32.3% token reduction]
        CF3 --> CF4[2.8-4.4x speed improvement]
        CF4 --> CF5[27+ neural models]
        CF5 --> CF6[Auto-healing workflows]
    end

    style CF1 fill:#51cf66
    style CF2 fill:#51cf66
    style CF3 fill:#51cf66
    style CF4 fill:#51cf66
```

## 🔗 Complete Example: Full-Stack Development

```mermaid
sequenceDiagram
    participant User
    participant Claude Code
    participant MCP
    participant Backend Agent
    participant Frontend Agent
    participant DB Agent
    participant Test Agent
    participant DevOps Agent

    User->>Claude Code: "Build a full-stack e-commerce app"

    Note over Claude Code,MCP: Step 1: Optional Coordination Setup
    Claude Code->>MCP: swarm_init(topology: "mesh", maxAgents: 5)

    Note over Claude Code: Step 2: Single Message - Spawn ALL Agents

    par Parallel Agent Spawning via Task Tool
        Claude Code->>Backend Agent: Task("Build REST API with Express...")
        Claude Code->>Frontend Agent: Task("Create React UI...")
        Claude Code->>DB Agent: Task("Design PostgreSQL schema...")
        Claude Code->>Test Agent: Task("Write Jest tests...")
        Claude Code->>DevOps Agent: Task("Setup Docker and CI/CD...")
    end

    par Agents Execute Coordination Protocol
        Backend Agent->>Backend Agent: pre-task hook
        Frontend Agent->>Frontend Agent: pre-task hook
        DB Agent->>DB Agent: pre-task hook
        Test Agent->>Test Agent: pre-task hook
        DevOps Agent->>DevOps Agent: pre-task hook
    end

    par Agents Share Context via Memory
        Backend Agent->>MCP: Store API contracts
        Frontend Agent->>MCP: Check API contracts
        DB Agent->>MCP: Store schema
        Test Agent->>MCP: Read API & schema
    end

    par Agents Produce Output
        Backend Agent->>User: backend/server.js
        Frontend Agent->>User: frontend/App.jsx
        DB Agent->>User: database/schema.sql
        Test Agent->>User: tests/*.test.js
        DevOps Agent->>User: Dockerfile, .github/workflows/
    end

    Note over User: Complete full-stack app delivered!
```

---

## Key Takeaways

1. **MCP Coordinates Strategy** - Sets up topology, defines agent types, manages memory
2. **Claude Code Executes Work** - Task tool spawns real agents that write code
3. **1 Message = All Operations** - Batch everything for maximum concurrency
4. **Hooks Enable Coordination** - Every agent uses pre/during/post hooks
5. **SPARC Provides Structure** - Systematic methodology for TDD
6. **54 Specialized Agents** - Each with specific expertise
7. **Never Save to Root** - Organize files in proper subdirectories
8. **Performance Gains** - 2.8-4.4x speed, 32.3% fewer tokens

**Remember: Claude Flow coordinates, Claude Code creates!** 🚀
