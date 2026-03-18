# NEURAL-CLAW Development Map

Brain-Modeled Multi-Agent Orchestration Canvas
MIZU Dialectical Architecture | OpenClaw Native | Ollama Local Inference

---

## Repository Structure

```
NeuralClaw/
├── canvas/                              # React UI application (Vite + React 19)
│   ├── index.html                       # Vite entry point
│   ├── package.json                     # Canvas dependencies
│   ├── vite.config.js                   # Vite build config
│   └── src/
│       ├── main.jsx                     # React mount point
│       ├── App.jsx                      # Root orchestration component
│       ├── theme/
│       │   └── mizu.js                  # MIZU design system (ternary color palette)
│       ├── constants/
│       │   ├── agents.js                # 16 brain-region agent definitions
│       │   ├── tiers.js                 # 7 anatomical tier groupings
│       │   ├── connections.js           # Synapse types (excitatory/inhibitory/modulatory)
│       │   └── corax.js                 # CoRax 12 constitutional governance dimensions
│       ├── api/
│       │   └── ollama.js                # Ollama streaming inference + health check
│       ├── state/
│       │   └── reducer.js               # Canvas state machine (nodes, connections, log)
│       ├── engine/
│       │   └── workflow.js              # BFS workflow execution engine
│       ├── utils/
│       │   └── helpers.js               # uid, trit utilities, clamp
│       └── components/
│           ├── TopBar.jsx               # Header bar (logo, status, run controls)
│           ├── NodePalette.jsx          # Left sidebar (drag-to-add agent palette)
│           ├── InspectorPanel.jsx       # Right sidebar (tabs container)
│           ├── StatusBar.jsx            # Bottom status bar
│           ├── nodes/
│           │   └── CNode.jsx            # Canvas node (agent card with ports)
│           ├── connections/
│           │   └── Conn.jsx             # SVG bezier synapse connections
│           ├── shared/
│           │   ├── TritBadge.jsx        # Ternary value indicator
│           │   ├── TritVec.jsx          # Trit vector display [S·T·R]
│           │   ├── StatusDot.jsx        # Node status indicator
│           │   ├── Label.jsx            # Form label
│           │   ├── Row.jsx              # Key-value display row
│           │   └── LogLine.jsx          # Timestamped log entry
│           └── inspector/
│               ├── InspectorTab.jsx     # Node details, trit editor, governance
│               ├── LogTab.jsx           # Scrollable activity log
│               └── ConfigTab.jsx        # Ollama endpoint, model selection
│
├── config/                              # Runtime configuration
│   ├── openclaw.json                    # OpenClaw gateway config
│   ├── openclaw-seccomp.json            # Seccomp syscall whitelist
│   └── .env.example                     # Environment variable template
│
├── docs/
│   └── research/
│       └── nemoclaw-merge-analysis.md   # NemoClaw integration research
│
├── docker-compose.yml                   # Full stack: Ollama, OpenClaw, Canvas, ChromaDB
├── setup.sh                             # Hardened Ubuntu deployment script
├── tailscale-acl.json                   # Tailscale mesh ACL (anatomical routing)
├── .gitignore
├── LICENSE                              # Apache 2.0
└── DEV_MAP.md                           # This file
```

---

## Architecture Overview

### The Brain Model

NEURAL-CLAW models multi-agent orchestration as a biological brain. Each agent maps to a brain region with a specific function. Signals flow through anatomically-correct pathways:

```
External Event
      ↓
  [BRAINSTEM]  RAS (trigger) → LC (alert escalation)
      ↓
  [THALAMUS]   THL (central router — ALL signals pass through)
      ↓
  [CORTEX]     PFC (planner) → MOTOR (executor) → BROCA (language out)
               SENSORY (input parser) ← WERNICKE (language comprehension)
      ↕
  [LIMBIC]     HIPPO (memory) ↔ AMYGDALA (threat) ↔ ACC (conflict)
      ↕
  [BASAL]      STRIATUM (action selection) ↔ VTA (reward/learning)
      ↕
  [CEREBELLUM] CBL (loop timing, error correction)
      ↓
  [OUTPUT]     OUT (final delivery)
```

### MIZU Dialectical System

Every signal carries a ternary trit vector `[S, T, R]`:
- **+1 Thesis** (excitatory) — structure, permission, forward motion
- **-1 Antithesis** (inhibitory) — challenge, restriction, blocking
- **0 Synthesis** (modulatory) — emergence, evaluation, modulation

### CoRax Governance

12 constitutional dimensions govern agent behavior:
Supervision, Review, Priority, Trust, Risk, Agent Nature, Computing,
Degradation, Content, Amendment, Kill Switch, Embodiment

Each node has a governance state: `PERMIT (+1)`, `EVALUATE (0)`, `RESTRICT (-1)`.
Restricted nodes are skipped during workflow execution.

---

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 19 | Canvas orchestration interface |
| Build Tool | Vite 6 | Dev server + production builds |
| Inference | Ollama (local) | LLM inference, no API keys needed |
| Agent Runtime | OpenClaw | ReAct loop, skills, WebSocket API |
| Vector Memory | ChromaDB | Hippocampus episodic memory store |
| Networking | Tailscale | Encrypted mesh VPN between nodes |
| Containers | Docker Compose | Full stack orchestration |
| Security | seccomp + UFW | Syscall filtering + firewall |

---

## Development Phases

### Phase 1 — Canvas Foundation (Current)
**Status: Scaffolded**

- [x] Monolith decomposed into modular React components
- [x] MIZU design system extracted
- [x] 16 brain-region agent definitions
- [x] Drag-and-drop canvas with node placement
- [x] SVG bezier connection rendering
- [x] Trit vector and governance editing
- [x] Ollama streaming inference integration
- [x] BFS workflow execution engine
- [x] Docker Compose stack definition
- [x] Hardened setup script (Ubuntu 24.04)
- [x] Tailscale ACL for anatomical routing

**Remaining work:**
- [ ] Install dependencies (`cd canvas && npm install`)
- [ ] Verify Vite dev server starts cleanly
- [ ] Test drag-drop and connection wiring
- [ ] Test Ollama inference with a basic RAS → THL → PFC → BROCA → OUT pipeline
- [ ] Add error boundaries to React components

### Phase 2 — OpenClaw Integration
**Status: Not started**

Connect the canvas UI to the OpenClaw agent runtime via WebSocket.

- [ ] Implement `useGateway` hook for WebSocket connection (`ws://127.0.0.1:18789`)
- [ ] Map brain-region agents to OpenClaw sub-agents
- [ ] Wire agent system prompts to OpenClaw chat sessions
- [ ] Implement session persistence (save/load canvas state)
- [ ] Add real-time agent status streaming from OpenClaw
- [ ] Integrate OpenClaw tool execution (exec, write, http, etc.)
- [ ] Add OpenClaw authentication (bearer token from gateway)

### Phase 3 — Hippocampus Memory System
**Status: Not started**

Wire ChromaDB as the persistent memory backend for the Hippocampus agent.

- [ ] Implement ChromaDB client in `canvas/src/api/chromadb.js`
- [ ] Add memory_read / memory_write tool implementations
- [ ] Build embedding pipeline (nomic-embed-text via Ollama)
- [ ] Add memory collection management (per-workflow, per-session)
- [ ] Implement memory retrieval with relevance scoring
- [ ] Add memory visualization in inspector panel
- [ ] Test episodic memory consolidation across workflow runs

### Phase 4 — CoRax Governance Engine
**Status: Not started**

Implement the full MIZU ternary dialectical governance system.

- [ ] Build CoRax governance evaluator (12-dimension scoring)
- [ ] Implement Amygdala threat detection pipeline
- [ ] Add ACC conflict resolution between agent outputs
- [ ] Wire governance to workflow execution (pre/post agent hooks)
- [ ] Build governance audit log (append-only, stored in `corax_audit` volume)
- [ ] Add governance dashboard in inspector panel
- [ ] Implement kill switch (immediate halt of all agents)
- [ ] Add policy YAML editor for runtime policy changes

### Phase 5 — Advanced Canvas Features
**Status: Not started**

Make the canvas a production-grade visual workflow builder.

- [ ] Canvas zoom and pan (transform matrix)
- [ ] Minimap for large workflows
- [ ] Node grouping / sub-workflows (collapsible brain regions)
- [ ] Connection type editing (click to cycle excitatory/inhibitory/modulatory)
- [ ] Undo/redo (state history stack)
- [ ] Canvas export/import (JSON workflow format)
- [ ] Keyboard shortcuts (Delete, Ctrl+Z, Space to pan)
- [ ] Multi-select and batch operations
- [ ] Snap-to-grid alignment
- [ ] Workflow templates (pre-built brain configurations)

### Phase 6 — NemoClaw Security Layer
**Status: Research complete (see docs/research/nemoclaw-merge-analysis.md)**

Integrate NVIDIA NemoClaw as the infrastructure security layer beneath NEURAL-CLAW.

- [ ] Add NemoClaw as optional Docker service in compose stack
- [ ] Wire NemoClaw policy proxy REST API (`/api/policy`)
- [ ] Build security control panel in canvas UI
- [ ] Implement network policy visualization (allowed/blocked endpoints)
- [ ] Add sandbox lifecycle management (create, list, delete)
- [ ] Wire MIZU governance to NemoClaw YAML policy (hot-reload)
- [ ] Add NIM inference routing alongside Ollama
- [ ] Implement OpenShell gateway API integration
- [ ] Test sandbox filesystem confinement (`/sandbox`, `/tmp` only)
- [ ] Test network isolation (default-deny + explicit allowlist)

### Phase 7 — Multi-Node Distributed Deployment
**Status: Not started**

Run brain regions across multiple machines connected via Tailscale mesh.

- [ ] Implement cross-node agent communication via Tailscale
- [ ] Add node discovery and health monitoring
- [ ] Deploy Thalamus as dedicated relay node
- [ ] Implement message serialization for cross-node synapses
- [ ] Add latency-aware routing (prefer local agents)
- [ ] Build cluster status dashboard
- [ ] Test Tailscale ACL enforcement (anatomical routing)
- [ ] Add DGX Spark / Station deployment playbooks

### Phase 8 — Learning & Adaptation
**Status: Not started**

Implement VTA reward-based learning across workflow executions.

- [ ] Build reward prediction error (RPE) calculation
- [ ] Implement path weight updates (strengthen/weaken synapses)
- [ ] Add Striatum habit formation (cache frequent action selections)
- [ ] Build Cerebellum loop optimization (auto-tune iteration counts)
- [ ] Implement workflow performance metrics
- [ ] Add A/B testing for agent model selection
- [ ] Build learning dashboard (reward curves, path weights)

---

## Agent Registry

| ID | Brain Region | Tier | Type | Model | Purpose |
|----|-------------|------|------|-------|---------|
| RAS | Reticular Formation | Brainstem | TRIGGER | none | Event entry point |
| LC | Locus Coeruleus | Brainstem | MONITOR | phi4-mini | Alert escalation |
| THL | Thalamic Relay | Thalamus | ROUTER | phi4-mini | Central message routing |
| PFC | Prefrontal Cortex | Cortex | ORCHESTRATOR | llama3.2 | Executive planning |
| MOTOR | Motor Cortex | Cortex | EXECUTOR | llama3.2 | Action execution |
| SENSORY | Sensory Cortex | Cortex | TRANSFORMER | phi4-mini | Input normalization |
| BROCA | Broca's Area | Cortex | TRANSFORMER | llama3.2 | Language production |
| WERNICKE | Wernicke's Area | Cortex | TRANSFORMER | llama3.2 | Language comprehension |
| HIPPO | Hippocampus | Limbic | MEMORY | phi4-mini | Episodic memory |
| AMYGDALA | Amygdala | Limbic | GOVERNANCE | phi4-mini | Threat detection |
| ACC | Anterior Cingulate | Limbic | GOVERNANCE | phi4-mini | Conflict resolution |
| STRIATUM | Striatum | Basal | DECISION | llama3.2 | Action selection |
| VTA | VTA Dopamine | Basal | MODULATOR | phi4-mini | Reward learning |
| CBL | Cerebellum | Cerebellum | LOOP | phi4-mini | Timing & error correction |
| OUT | Output Action | Output | OUTPUT | none | Final delivery |

---

## Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `ollama` | ollama/ollama | 127.0.0.1:11434 | Local LLM inference |
| `model_bootstrap` | ollama/ollama | — | Pull models on first run |
| `openclaw` | ghcr.io/openclaw/openclaw | 127.0.0.1:18789 | Agent runtime gateway |
| `canvas` | node:22-alpine | 127.0.0.1:3000 | NEURAL-CLAW UI |
| `hippocampus` | chromadb/chroma | 127.0.0.1:8000 | Vector memory store |
| `corax_audit` | alpine | — | Governance audit log |

All ports bound to loopback only. Access via Tailscale VPN.

---

## Models Required

| Model | Size | Agent Usage | Pull Command |
|-------|------|-------------|--------------|
| llama3.2:3b | ~2GB | PFC, MOTOR, BROCA, WERNICKE, STRIATUM | `ollama pull llama3.2:3b` |
| phi4-mini | ~1.5GB | THL, LC, SENSORY, HIPPO, AMYGDALA, ACC, VTA, CBL | `ollama pull phi4-mini` |
| nomic-embed-text | ~274MB | Hippocampus embeddings | `ollama pull nomic-embed-text` |
| qwen2.5-coder:7b | ~4.7GB | (optional) Code-focused agents | `ollama pull qwen2.5-coder:7b` |

Minimum RAM: 8GB (llama3.2:3b + phi4-mini loaded concurrently)
Recommended: 16GB+ for comfortable multi-agent operation

---

## Security Model

### Network
- All services on internal Docker bridge network
- Ports exposed to 127.0.0.1 only (loopback)
- Tailscale mesh for remote access (WireGuard encrypted)
- UFW default-deny + Docker-UFW bypass fix applied
- Tailscale ACL enforces anatomical routing between brain regions

### Containers
- Non-root user (`openclaw`, UID 1000)
- seccomp profile whitelisting allowed syscalls
- `no-new-privileges` on all containers
- Read-only root filesystem where possible
- `cap_drop: ALL` with minimal capabilities added back

### Authentication
- OpenClaw gateway: bearer token (auto-generated, 256-bit)
- ChromaDB: token auth
- SSH: key-only, port 2222, Fail2ban enabled
- No API keys required for local-only operation

---

## Integration Points (Future)

| Interface | Protocol | Purpose |
|-----------|----------|---------|
| OpenClaw Gateway | WebSocket `ws://127.0.0.1:18789` | Agent chat, tools, sessions |
| NemoClaw Policy Proxy | REST `/api/policy` | Security policy read/write |
| OpenShell Gateway | REST | Sandbox lifecycle management |
| NIM Endpoints | OpenAI-compatible REST | NVIDIA model inference |
| Ollama API | REST `http://127.0.0.1:11434` | Local model inference |
| ChromaDB | REST `http://127.0.0.1:8000` | Vector memory operations |
| MCP/A2A | Protocol-specific | External agent communication |
