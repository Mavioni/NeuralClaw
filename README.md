<p align="center">
  <br />
  <br />
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/%E2%9C%A6-NEURAL--CLAW-00D4AA?style=for-the-badge&labelColor=0A0E17&color=00D4AA">
    <img alt="NEURAL-CLAW" src="https://img.shields.io/badge/%E2%9C%A6-NEURAL--CLAW-00D4AA?style=for-the-badge&labelColor=0A0E17&color=00D4AA">
  </picture>
  <br />
  <br />
  <em>Brain-modeled multi-agent orchestration.<br />Local-first. Ternary-native. Sovereign.</em>
  <br />
  <br />
</p>

<p align="center">
  <a href="#quickstart"><strong>Quickstart</strong></a> &ensp;·&ensp;
  <a href="#architecture"><strong>Architecture</strong></a> &ensp;·&ensp;
  <a href="#the-brain"><strong>The Brain</strong></a> &ensp;·&ensp;
  <a href="#mizu-dialectics"><strong>MIZU</strong></a> &ensp;·&ensp;
  <a href="#trit-trt"><strong>TRIT-TRT</strong></a> &ensp;·&ensp;
  <a href="#deployment"><strong>Deploy</strong></a> &ensp;·&ensp;
  <a href="#roadmap"><strong>Roadmap</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-00D4AA?style=flat-square&logo=react&logoColor=white&labelColor=0A0E17" />
  <img src="https://img.shields.io/badge/vite-6-00D4AA?style=flat-square&logo=vite&logoColor=white&labelColor=0A0E17" />
  <img src="https://img.shields.io/badge/python-3.10+-00D4AA?style=flat-square&logo=python&logoColor=white&labelColor=0A0E17" />
  <img src="https://img.shields.io/badge/bitnet-1.58_bit-C05046?style=flat-square&labelColor=0A0E17" />
  <img src="https://img.shields.io/badge/docker-compose-2B5F90?style=flat-square&logo=docker&logoColor=white&labelColor=0A0E17" />
  <img src="https://img.shields.io/badge/license-AGPL--3.0-8B7A55?style=flat-square&labelColor=0A0E17" />
</p>

<br />

---

<br />

## What is this?

**NEURAL-CLAW** is a visual multi-agent orchestration system where AI agents are mapped to regions of a biological brain. You drag brain regions onto a canvas, wire them together with synapses, and watch signals propagate through an anatomically-correct neural architecture — all running locally on your hardware.

Every signal carries a **ternary trit vector**. Every model weight is a **ternary value**. Every reasoning step follows the **dialectical loop**: generate, challenge, synthesize. The philosophy isn't a metaphor — it's the implementation.

```
You build a brain. You give it a task. It thinks.
```

<br />

## Architecture

```
                              ┌──────────────────────────────────────────┐
                              │            NEURAL-CLAW Canvas            │
                              │         React 19 · Vite 6 · :3000       │
                              │                                          │
                              │   ┌─────┐   ┌─────┐   ┌─────┐          │
                              │   │ RAS ├──→│ THL ├──→│ PFC │          │
                              │   └─────┘   └──┬──┘   └──┬──┘          │
                              │                │         │              │
                              │           ┌────┴───┐  ┌──┴────┐        │
                              │           │ AMYGDL │  │ MOTOR │        │
                              │           └────────┘  └──┬────┘        │
                              │                          │              │
                              │                       ┌──┴───┐         │
                              │                       │ OUT  │         │
                              │                       └──────┘         │
                              └────────────┬────────────┬──────────────┘
                                           │            │
                          ┌────────────────┴──┐   ┌─────┴───────────────┐
                          │    TRIT-TRT :8765  │   │   Ollama :11434     │
                          │   ╭──────────────╮ │   │   (fallback)        │
                          │   │ BitNet b1.58 │ │   └────────────────────┘
                          │   │  {-1, 0, +1} │ │
                          │   ╰──────┬───────╯ │
                          │   ╭──────┴───────╮ │
                          │   │  AirLLM      │ │   ┌────────────────────┐
                          │   │  4GB VRAM    │ │   │  ChromaDB :8000    │
                          │   ╰──────┬───────╯ │   │  (hippocampus)     │
                          │   ╭──────┴───────╮ │   └────────────────────┘
                          │   │  TRT Loop    │ │
                          │   │  G→S→R       │ │   ┌────────────────────┐
                          │   ╰──────────────╯ │   │  OpenClaw :18789   │
                          └────────────────────┘   │  (agent runtime)   │
                                                   └────────────────────┘
```

<br />

| Layer | Technology | Role |
|:------|:-----------|:-----|
| **Canvas** | React 19 + Vite 6 | Visual drag-and-drop brain builder |
| **Inference** | TRIT-TRT (BitNet b1.58) | Ternary-native dialectical reasoning |
| **Fallback** | Ollama | Standard local LLM when TRIT-TRT unavailable |
| **Runtime** | OpenClaw | ReAct agent loop, tool execution, WebSocket API |
| **Memory** | ChromaDB | Vector store for hippocampus episodic memory |
| **Network** | Tailscale | Encrypted mesh VPN with anatomical ACLs |
| **Security** | seccomp + UFW + Docker | Defense-in-depth container isolation |

<br />

## Quickstart

### Prerequisites

- Docker + Docker Compose
- Git (with submodule support)
- 4 GB RAM minimum (BitNet ternary is *very* efficient)

### One-command deploy

```bash
git clone --recurse-submodules https://github.com/Mavioni/NeuralClaw.git
cd NeuralClaw
sudo bash setup.sh
```

This will:
1. Create a hardened `openclaw` user
2. Install Tailscale + Docker
3. Configure UFW firewall (default-deny)
4. Harden SSH (key-only, port 2222)
5. Build and launch the full stack
6. Download the BitNet b1.58 ternary model (~500 MB)

### Manual (development)

```bash
# Clone
git clone --recurse-submodules https://github.com/Mavioni/NeuralClaw.git
cd NeuralClaw

# Start infrastructure
docker compose up -d ollama trit_trt hippocampus

# Launch canvas dev server
cd canvas
npm install
npm run dev        # → http://localhost:3000
```

### Verify

```bash
# Check all services
docker compose ps

# Test TRIT-TRT
curl http://localhost:8765/health

# Test Ollama
curl http://localhost:11434/api/tags
```

<br />

## The Brain

NEURAL-CLAW models multi-agent orchestration as a biological nervous system. Each of the **16 agents** maps to an anatomical brain region with a specific cognitive function. Signals flow through biologically-plausible pathways — you can't skip the thalamus.

```
External Event
      ↓
  BRAINSTEM    RAS (trigger) → LC (alert escalation)
      ↓
  THALAMUS     THL — central relay. ALL signals pass through.
      ↓
  CORTEX       PFC (plan) → MOTOR (execute) → BROCA (speak)
               SENSORY (parse) ← WERNICKE (comprehend)
      ↕
  LIMBIC       HIPPO (remember) ↔ AMYGDALA (threat) ↔ ACC (conflict)
      ↕
  BASAL        STRIATUM (select action) ↔ VTA (reward signal)
      ↕
  CEREBELLUM   CBL (timing, error correction, loop control)
      ↓
  OUTPUT       OUT — final delivery
```

### Agent Registry

| Agent | Region | Function | Type |
|:------|:-------|:---------|:-----|
| **RAS** | Reticular Formation | Event entry point, attention gating | Trigger |
| **LC** | Locus Coeruleus | Alert escalation, urgency broadcast | Monitor |
| **THL** | Thalamic Relay | Central message routing | Router |
| **PFC** | Prefrontal Cortex | Executive planning, decision making | Orchestrator |
| **MOTOR** | Motor Cortex | Task execution | Executor |
| **SENSORY** | Sensory Cortex | Input normalization | Transformer |
| **BROCA** | Broca's Area | Language production | Transformer |
| **WERNICKE** | Wernicke's Area | Language comprehension | Transformer |
| **HIPPO** | Hippocampus | Episodic memory store/retrieve | Memory |
| **AMYGDALA** | Amygdala | Threat detection, risk scoring | Governance |
| **ACC** | Anterior Cingulate | Conflict resolution | Governance |
| **STRIATUM** | Striatum | Action selection, habit formation | Decision |
| **VTA** | VTA Dopamine | Reward prediction error | Modulator |
| **CBL** | Cerebellum | Loop timing, error correction | Loop |
| **OUT** | Output Action | Final result delivery | Output |

> All LLM-powered agents use **TRIT-TRT** (BitNet b1.58) with automatic **Ollama** fallback.

<br />

## MIZU Dialectics

MIZU is the ternary dialectical system that governs every layer of NEURAL-CLAW. It's not decoration — it's the control plane.

### The Trit

Every signal between agents carries a **trit vector** `[S, T, R]`:

| Value | Name | Meaning | Synapse | Color |
|:-----:|:-----|:--------|:--------|:------|
| **+1** | Thesis | Structure, permission, forward | Excitatory | `#C05046` |
| **-1** | Antithesis | Challenge, restriction, block | Inhibitory | `#2B5F90` |
| **0** | Synthesis | Emergence, evaluation, modulate | Modulatory | `#8B7A55` |

### CoRax Governance

Each agent carries a governance state across **12 constitutional dimensions**:

> Supervision · Review · Priority · Trust · Risk · Agent Nature · Computing · Degradation · Content · Amendment · Kill Switch · Embodiment

A node set to `RESTRICT (-1)` is skipped during workflow execution. `EVALUATE (0)` executes with monitoring. `PERMIT (+1)` runs freely. You tune governance per-agent, per-dimension, in the inspector panel.

<br />

## TRIT-TRT

**TRIT-TRT** (Ternary Recursive Inference Thinking) is the native inference engine. The alignment between MIZU and the inference stack is both philosophical and mechanical:

| MIZU Dialectic | TRIT-TRT Layer | What Happens |
|:---------------|:---------------|:-------------|
| **Thesis (+1)** | Generate | Produce N candidate responses |
| **Antithesis (-1)** | Select | Reject weak candidates via self-consistency voting |
| **Synthesis (0)** | Reflect | Extract reusable insights from the reasoning process |
| *Trit weights* | BitNet b1.58 | Model weights are *literally* `{-1, 0, +1}` |
| *Sovereignty* | AirLLM sharding | Run 70B models in 4 GB VRAM. No cloud. |

### Why ternary?

BitNet b1.58 compresses model weights to three values: `{-1, 0, +1}`. This gives:
- **10x** model size reduction vs FP16
- **2-6x** CPU inference speedup
- **55-82%** energy savings
- The model weights *are* the same thesis/antithesis/synthesis that governs the architecture

The 2B parameter model runs comfortably on **4 GB VRAM** or CPU-only at 2-7 tok/s.

```python
from trit_trt import TritTRT

engine = TritTRT("microsoft/BitNet-b1.58-2B-4T")

# Dialectical reasoning (Generate → Select → Reflect)
result = engine.generate("Design a distributed task queue", use_trt=True)
print(result.text)          # Best candidate after dialectical refinement
print(result.confidence)    # 0.0 - 1.0
print(result.rounds_used)   # How many G→S→R cycles ran
```

<br />

## Canvas UI

The canvas is a visual brain builder. Drag agents from the palette. Wire them with synapses. Run workflows.

### Controls

| Action | Gesture |
|:-------|:--------|
| Add agent | Drag from left palette onto canvas |
| Connect | Click output port → click input port |
| Inspect | Click any node → right panel |
| Edit trit vector | Inspector → `[S·T·R]` buttons |
| Set governance | Inspector → RESTRICT / EVALUATE / PERMIT |
| Delete connection | Right-click the synapse line |
| Run workflow | Top bar → **Run** button |
| Reset outputs | Top bar → **Reset** button |

### Configuration

Settings live in the **Config** tab of the inspector panel:

| Setting | Default | Description |
|:--------|:--------|:------------|
| TRIT-TRT endpoint | `ws://localhost:8765` | Primary inference backend |
| Ollama endpoint | `http://localhost:11434` | Fallback inference |
| Model | `llama3.2` | Ollama fallback model |
| TRT rounds | `3` | Dialectical reasoning iterations |
| TRT candidates | `8` | Parallel solutions per round |

<br />

## Deployment

### Docker Services

| Service | Port | Purpose |
|:--------|:-----|:--------|
| `trit_trt` | `127.0.0.1:8765` | Primary ternary inference (BitNet + TRT) |
| `ollama` | `127.0.0.1:11434` | Fallback LLM inference |
| `canvas` | `127.0.0.1:3000` | NEURAL-CLAW UI |
| `openclaw` | `127.0.0.1:18789` | Agent runtime gateway |
| `hippocampus` | `127.0.0.1:8000` | ChromaDB vector memory |
| `corax_audit` | — | Governance audit log (append-only) |

> All ports bound to **loopback only**. Remote access via Tailscale mesh VPN.

### Security Model

**Network** — All services on internal Docker bridge. Ports loopback-only. Tailscale mesh for remote access (WireGuard). UFW default-deny with Docker-UFW bypass fix. Anatomical routing via Tailscale ACLs.

**Containers** — Non-root user (UID 1000). seccomp syscall whitelist. `no-new-privileges` on all containers. Read-only root filesystem. `cap_drop: ALL` with minimal add-back.

**Auth** — OpenClaw gateway: auto-generated 256-bit bearer token. ChromaDB: token auth. SSH: key-only, port 2222, Fail2ban.

**Zero API keys required** for local-only operation.

### Tailscale Anatomical Routing

The Tailscale ACL enforces brain-accurate network topology across distributed deployments:

```
tag:neural-brainstem   →  tag:neural-thalamus       (brainstem fires to relay)
tag:neural-thalamus    →  tag:neural-cortex          (relay distributes to cortex)
tag:neural-cortex      →  tag:neural-limbic          (cortex queries memory/threat)
tag:neural-limbic      →  tag:corax-oversight        (amygdala escalates to governance)
tag:corax-oversight    →  *                           (kill switch reaches everything)
```

No agent can reach another without traversing its anatomical relay.

<br />

## Project Structure

```
NeuralClaw/
│
├── canvas/                          React 19 + Vite 6 — visual brain builder
│   ├── src/
│   │   ├── App.jsx                  Root orchestration component
│   │   ├── theme/mizu.js           MIZU ternary color system
│   │   ├── constants/
│   │   │   ├── agents.js           16 brain-region agent definitions
│   │   │   ├── tiers.js            7 anatomical tier groupings
│   │   │   ├── connections.js      Synapse types (excitatory/inhibitory/modulatory)
│   │   │   └── corax.js            12 CoRax governance dimensions
│   │   ├── api/
│   │   │   ├── trit-trt.js         WebSocket client for ternary inference
│   │   │   └── ollama.js           REST client for Ollama fallback
│   │   ├── state/reducer.js        Canvas state machine
│   │   ├── engine/workflow.js      BFS workflow execution engine
│   │   └── components/             UI components (nodes, connections, inspector)
│   └── package.json
│
├── trit-trt/                        Submodule — ternary inference engine
│   ├── trit_trt/
│   │   ├── engine.py               TritTRT orchestrator + backend routing
│   │   ├── bitnet_engine.py        BitNet b1.58 subprocess wrapper
│   │   ├── layer_shard.py          AirLLM layer-wise memory sharding
│   │   ├── trt_engine.py           Generate → Select → Reflect loop
│   │   ├── knowledge_store.py      Persistent insight accumulator
│   │   └── config.py               Dataclass configuration + YAML loader
│   ├── ui/                         FastAPI WebSocket server
│   ├── configs/default.yaml        Default TRT parameters
│   └── scripts/setup_model.sh      Model download + build automation
│
├── config/
│   ├── openclaw.json               OpenClaw gateway configuration
│   ├── openclaw-seccomp.json       Seccomp syscall whitelist
│   ├── Dockerfile.trit-trt         TRIT-TRT container build
│   └── .env.example                Environment variable template
│
├── docs/research/                   Integration research & analysis
├── docker-compose.yml              Full stack definition (7 services)
├── setup.sh                        Hardened Ubuntu deployment script
├── tailscale-acl.json              Anatomical mesh network routing
└── DEV_MAP.md                      Detailed development map & phase tracker
```

<br />

## Roadmap

| Phase | Status | Description |
|:------|:-------|:------------|
| **1. Canvas Foundation** | Scaffolded | Modular React canvas, MIZU theme, 16 agents, workflow engine |
| **2. OpenClaw Integration** | Not started | WebSocket agent runtime, tool execution, session persistence |
| **3. Hippocampus Memory** | Not started | ChromaDB episodic memory, embeddings, retrieval |
| **4. CoRax Governance** | Not started | 12-dimension scoring, threat detection, audit log |
| **5. Advanced Canvas** | Not started | Zoom/pan, minimap, undo/redo, templates |
| **6. NemoClaw Security** | Research done | NVIDIA NemoClaw sandbox + policy engine integration |
| **7. Distributed Deploy** | Not started | Multi-node brain across Tailscale mesh |
| **8. Learning** | Not started | VTA reward learning, path weight adaptation |

<br />

## Models

### Primary: BitNet b1.58 (ternary)

| Model | Parameters | Disk | VRAM | Speed |
|:------|:-----------|:-----|:-----|:------|
| BitNet-b1.58-2B-4T | 2B | ~500 MB | 4 GB | 2-7 tok/s |

Weights are `{-1, 0, +1}`. 10x smaller than FP16 equivalents. Runs on CPU.

### Fallback: Ollama

| Model | Size | Purpose |
|:------|:-----|:--------|
| llama3.2:3b | ~2 GB | Agent inference fallback |
| phi4-mini | ~1.5 GB | Fast sub-agent tasks |
| nomic-embed-text | ~274 MB | Hippocampus embeddings |

<br />

## Contributing

NEURAL-CLAW is in active early development. The canvas is scaffolded, the inference engine works, and the Docker stack is defined. See [`DEV_MAP.md`](DEV_MAP.md) for the full development map, per-phase task lists, and architectural decisions.

```bash
# Development
cd canvas && npm install && npm run dev

# Tests
cd trit-trt && pip install -e ".[dev]" && pytest

# Lint
cd canvas && npm run lint
```

<br />

## License

[AGPL-3.0](LICENSE) — Massimo / Yunis AI

<br />

---

<p align="center">
  <sub>
    <em>The weights are trits. The signals are trits. The reasoning is dialectical.</em>
    <br />
    <em>It's trits all the way down.</em>
  </sub>
</p>
