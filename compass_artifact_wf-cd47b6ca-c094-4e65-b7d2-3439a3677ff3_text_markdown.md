# NemoClaw is a security wrapper, not an agent framework

**NemoClaw is not what most people assume it is.** It is not a standalone multi-agent orchestration platform, agent framework, or AI pipeline system. It is an **OpenClaw plugin for NVIDIA OpenShell** — a security, sandboxing, and inference-routing layer that wraps an existing OpenClaw installation with enterprise-grade policy enforcement. This distinction fundamentally changes the merge calculus with NEURAL-CLAW: NemoClaw brings **zero new agent primitives or orchestration logic** but offers a **production-grade security runtime, declarative policy engine, and controlled inference routing** that NEURAL-CLAW currently lacks entirely.

The repository is a TypeScript/Python hybrid at **alpha stage** (announced GTC 2026, March 16), licensed Apache 2.0, with ~3.8k GitHub stars and 12 contributors across 189 commits. Its architecture follows a thin-plugin/versioned-blueprint pattern where the TypeScript layer handles CLI interaction and the Python layer drives all sandbox orchestration through NVIDIA's OpenShell runtime.

---

## The actual architecture is two components, not one

NemoClaw's codebase splits cleanly into two independent components that communicate via subprocess execution — a pattern that matters for merge planning because it means the security layer is decoupled from any specific frontend or agent runtime.

### Component 1 — TypeScript plugin (`nemoclaw/`)

This is a thin OpenClaw CLI extension using Commander.js. It registers commands under the `openclaw nemoclaw` namespace and manages blueprint lifecycle. The complete source structure:

```
nemoclaw/
├── src/
│   ├── index.ts              # Plugin entry — registers all commands with OpenClaw
│   ├── cli.ts                # Commander.js subcommand wiring
│   ├── commands/
│   │   ├── launch.ts         # Bootstrap OpenClaw inside OpenShell sandbox
│   │   ├── connect.ts        # Open interactive shell into sandbox
│   │   ├── status.ts         # Blueprint run state + sandbox health
│   │   ├── logs.ts           # Stream blueprint and sandbox logs (supports -f)
│   │   └── slash.ts          # /nemoclaw slash command for OpenClaw chat
│   └── blueprint/
│       ├── resolve.ts        # Version resolution, cache management
│       ├── fetch.ts          # Download blueprint from OCI registry
│       ├── verify.ts         # Digest verification, compatibility checks
│       ├── exec.ts           # Subprocess execution of Python blueprint runner
│       └── state.ts          # Persistent state (run IDs)
├── openclaw.plugin.json      # Plugin manifest
├── package.json              # ~674 npm packages in dependency tree
├── tsconfig.json
└── vitest.config.ts
```

### Component 2 — Python blueprint (`nemoclaw-blueprint/`)

A versioned artifact with its own release stream, distributed via OCI registry with digest verification. Contains all orchestration logic for creating sandboxes, applying policies, and configuring inference:

```
nemoclaw-blueprint/
├── blueprint.yaml            # Manifest: version, profiles, min_openshell_version,
│                             #   min_openclaw_version constraints
├── orchestrator/
│   └── runner.py             # CLI runner: plan / apply / status
└── policies/
    └── openclaw-sandbox.yaml # Baseline network + filesystem policy
```

### Full repository tree

```
NVIDIA/NemoClaw/
├── .agents/skills/update-docs-from-commits/   # Auto-docs agent skill
├── .jensenclaw/                                # Jensen-themed config
├── bin/                                        # nemoclaw host CLI binary
├── docs/                                       # Published to docs.nvidia.com/nemoclaw
├── nemoclaw/                                   # TypeScript plugin (above)
├── nemoclaw-blueprint/                         # Python blueprint (above)
├── scripts/                                    # install.sh helpers, Node.js setup
├── test/                                       # Vitest test suite
├── Dockerfile                                  # Based on OpenShell sandbox image
├── Makefile
├── install.sh / uninstall.sh                   # One-command setup/teardown
├── package.json                                # Root npm config
├── pyproject.toml                              # Python project config (uv)
├── uv.lock                                     # Python lockfile
├── LICENSE                                     # Apache 2.0
├── CONTRIBUTING.md / SECURITY.md
└── spark-install.md                            # DGX Spark guide
```

Language composition: **TypeScript 33.9%**, JavaScript 30.0%, Shell 25.4%, Python 5.3%, HTML 4.2%, Dockerfile 0.9%, Makefile 0.3%.

---

## The security runtime is the actual value proposition

NemoClaw's technical contribution is the OpenShell sandbox integration — four enforcement layers that operate **on the execution environment, not inside the agent**. This means a compromised agent cannot override them.

**Network isolation (netns)** enforces a default-deny posture on all outbound connections. Only explicitly listed endpoints in the YAML policy are allowed. When the agent attempts to reach an unlisted host, OpenShell blocks the request and surfaces it in a terminal UI for operator approval. This layer is **hot-reloadable at runtime** — policies can be updated without recreating the sandbox.

**Filesystem confinement (Landlock)** restricts the agent to writing only inside `/sandbox` and `/tmp`. System paths like `/usr`, `/lib`, and `/etc` are read-only. This layer is **locked at sandbox creation** and cannot be changed afterward.

**Process isolation (seccomp)** blocks privilege escalation and dangerous syscalls. Also **locked at creation**.

**Inference interception** reroutes all model API calls through the OpenShell gateway to controlled backends. The agent never makes direct outbound inference calls. This is **hot-reloadable**.

The policy format is declarative YAML with binary-scoped network enforcement and L7 REST policy rules:

```yaml
filesystem_policy:
  read_only: [/usr, /lib, /proc, /etc]
  read_write: [/sandbox, /tmp, /dev/null]

network_policies:
  nvidia:
    endpoints:
      - { host: integrate.api.nvidia.com, port: 443 }
    binaries:
      - { path: /usr/bin/python3 }
  github_rest_api:
    endpoints:
      - host: api.github.com
        port: 443
        protocol: rest
        tls: terminate
        enforcement: enforce
        rules:
          - allow: { method: GET, path: "/**" }
```

The entire sandbox runs as a **K3s Kubernetes cluster inside a single Docker container** — no separate K8s install required. Container image: `ghcr.io/nvidia/openshell-community/sandboxes/openclaw`.

---

## Three inference profiles with local model support

NemoClaw routes inference through the OpenShell gateway, which strips caller credentials, injects backend credentials, and forwards to the configured provider. Three profiles ship in `blueprint.yaml`:

| Profile | Provider | Model | Endpoint | Use case |
|---------|----------|-------|----------|----------|
| `default` | NVIDIA Cloud (`nvidia` type) | `nvidia/nemotron-3-super-120b-a12b` | `integrate.api.nvidia.com/v1` | Production — requires NVIDIA API key |
| `nim-local` | Local NIM (`openai`-compatible) | `nvidia/nemotron-3-super-120b-a12b` | `nim-service.local:8000/v1` | On-premises NIM container |
| `vllm` | vLLM (`openai`-compatible) | `nvidia/nemotron-3-nano-30b-a3b` | `host.openshell.internal:8000/v1` | Local development |

Available Nemotron models span **30B to 253B parameters**: Nemotron 3 Nano (30B-a3b), Nemotron 3 Super (120B-a12b, 49B), Nemotron Ultra (253B). All use hybrid Mamba-Transformer MoE architectures with **131K token context windows**. Profile switching at runtime requires no restart: `openshell inference set --provider <name> --model <model>`.

**Ollama is auto-detected** during the `nemoclaw onboard` wizard (e.g., `nemotron-3-nano` on `ollama-local`), but **local inference is buggy in alpha** — DNS routing issues inside sandbox network namespaces on macOS, provider-not-found errors on DGX Spark. NVIDIA Cloud API is the only fully reliable inference path today.

---

## Configuration lives in YAML, env vars, and JSON credentials

| File/Variable | Purpose | Format |
|---|---|---|
| `blueprint.yaml` | Version, profiles, compatibility constraints | YAML |
| `openclaw-sandbox.yaml` | Network + filesystem policy baseline | YAML |
| `openclaw.plugin.json` | Plugin manifest for OpenClaw extension system | JSON |
| `~/.nemoclaw/credentials.json` | NVIDIA API key storage | JSON |
| `NVIDIA_API_KEY` | Cloud inference authentication | Env var |
| `NIM_API_KEY` | Local NIM service auth | Env var |
| `OPENAI_API_KEY` | vLLM local auth (defaults to `dummy`) | Env var |
| `TELEGRAM_BOT_TOKEN` | Telegram bridge service | Env var |
| `NEMOCLAW_GPU` | GPU type for remote deploy | Env var |

---

## CLI commands expose the full operational surface

NemoClaw provides two command interfaces — **host commands** (`nemoclaw` binary) and **plugin commands** (`openclaw nemoclaw` namespace):

**Host commands** handle lifecycle management: `nemoclaw setup` runs the full guided wizard (gateway → providers → sandbox → inference → policy), `nemoclaw <name> connect` opens an interactive shell, `nemoclaw deploy <instance>` provisions a remote GPU via Brev, and `nemoclaw term` launches the OpenShell TUI for real-time monitoring and egress approval.

**Plugin commands** operate inside the OpenClaw context: `openclaw nemoclaw launch [--profile <p>]` bootstraps the sandbox, `openclaw nemoclaw status [--json]` reports health (with JSON output for programmatic use), and `/nemoclaw` provides quick actions inside the OpenClaw chat interface.

---

## What NemoClaw does vs what OpenClaw does natively

This comparison is critical for the NEURAL-CLAW merge because it defines exactly what each layer contributes:

| Capability | OpenClaw (native) | NemoClaw (adds) |
|---|---|---|
| **Agent runtime** | ReAct reasoning loop, 24/7 autonomous operation | None — uses OpenClaw's runtime unchanged |
| **Memory** | Local Markdown files (AGENTS.md, TOOLS.md, USER.md) | Same, but confined to `/sandbox` |
| **Skills** | ClawHub registry (13,729+ skills), auto-install | Same, but policy-governed egress for downloads |
| **Model support** | Any provider: Claude, GPT, Ollama, LM Studio, etc. | Routes all inference through OpenShell gateway |
| **UI** | Lit Web Components SPA + macOS companion app | MutationObserver overlay extension (zero-fork) |
| **WebSocket API** | `ws://127.0.0.1:18789` — JSON frame protocol | Same + policy proxy REST at `/api/policy` |
| **Messaging** | 22+ platforms (WhatsApp, Telegram, Slack, etc.) | Adds Telegram bridge as managed service |
| **Security** | Configurable tool policies, exec approvals | **Full sandbox**: netns, seccomp, Landlock, YAML policies |
| **Filesystem** | Full host access | Confined to `/sandbox` and `/tmp` |
| **Network** | Open | Default-deny with declarative YAML + interactive approval |
| **Deployment** | `curl install.sh \| bash` | Remote GPU via Brev, DGX Spark/Station playbooks |
| **License** | MIT | Apache 2.0 |
| **Maturity** | Production-used (247K stars) | Alpha (3.8K stars, APIs unstable) |

**OpenClaw provides everything NEURAL-CLAW's agent layer needs** — the ReAct loop, memory, skills, multi-channel messaging, model-agnostic inference. **NemoClaw provides everything NEURAL-CLAW's security layer needs** — sandboxing, network policy, filesystem confinement, controlled inference routing, and enterprise deployment tooling.

---

## The NeMo Agent Toolkit is the broader NVIDIA ecosystem bridge

NemoClaw is one piece of NVIDIA's Agent Toolkit, which also includes the **NeMo Agent Toolkit** (`nvidia-nat`, Python library) and **OpenShell** (Rust runtime). The Agent Toolkit brings capabilities NemoClaw alone does not:

- **Agent Performance Primitives (APP)**: Parallel execution, speculative branching, and node-level priority routing for graph-based frameworks (LangChain, CrewAI, Agno)
- **MCP server publishing**: Expose any workflow as an MCP server via FastMCP — a direct integration point for NEURAL-CLAW's multi-agent orchestration
- **A2A Protocol**: Build distributed agent teams with authentication — aligns with NEURAL-CLAW's multi-agent canvas
- **YAML workflow configs**: Declarative agent/tool/LLM definitions that could feed NEURAL-CLAW's visual pipeline builder
- **NVIDIA Dynamo**: Datacenter-scale inference with KV-aware routing, per-request priority hints, and agentic inference features (cache pinning, latency-sensitive routing)
- **AI-Q Blueprint**: LangGraph-based research agent with shallow/deep research modes, hybrid model routing (frontier for orchestration, open models for research), and >50% cost reduction

The Agent Toolkit is currently **Python-only** but has TypeScript/Rust/Go/WASM on its roadmap.

---

## Integration points for the NEURAL-CLAW merge

The merge should treat NemoClaw as a **security and infrastructure layer** beneath NEURAL-CLAW's React orchestration canvas, not as a peer-level feature source. Here are the concrete integration paths:

**WebSocket gateway** (`ws://127.0.0.1:18789`): OpenClaw's primary API. Already proven with React via third-party projects PinchChat (`React 19 + TypeScript`, custom `useGateway` hook) and Nerve (`React 19 + Tailwind + shadcn/ui + Vite 7`). NEURAL-CLAW's React app connects here for chat, tool calls, session management, and streaming.

**Policy proxy REST API** (`/api/policy`): Exposed by NemoClaw's DevX UI extension (`policy-proxy.js`). Read/write YAML policies at runtime from React. This gives NEURAL-CLAW's canvas a security control panel — toggle network rules, view blocked requests, approve egress.

**OpenShell gateway API**: All sandbox management (create, list, delete, port-forward) via REST. NEURAL-CLAW could expose sandbox lifecycle in its UI.

**NIM endpoints**: Standard OpenAI-compatible REST API. NEURAL-CLAW's Ollama local inference can coexist — NIM for NVIDIA models, Ollama for everything else. The OpenShell privacy router mediates.

**MCP/A2A protocols**: The NeMo Agent Toolkit can publish workflows as MCP servers and supports A2A for distributed agents. NEURAL-CLAW's MIZU dialectical governance could consume these as external agent nodes.

**NemoClaw's UI extension pattern**: Uses `MutationObserver` to inject overlays onto OpenClaw's Lit Web Components DOM — a zero-fork approach. NEURAL-CLAW could adopt this pattern in reverse, injecting its React canvas as an overlay or running alongside the existing UI.

---

## Dependencies, Docker, and deployment configuration

**npm dependencies** (~674 packages total, 3 known vulnerabilities — 2 high, 1 critical as of launch). Key deps include Commander.js (CLI), vitest (testing), TypeScript, ESLint, Prettier. The package is **not yet published to npm** (issue #71) — install is via `npm install -g git+https://github.com/nvidia/NemoClaw.git`.

**Python dependencies** managed via `pyproject.toml` and `uv.lock` (uv package manager). Blueprint is a versioned Python artifact with its own release cycle.

**Dockerfile** exists at root, builds from `ghcr.io/nvidia/openshell-community/sandboxes/openclaw:latest`. Bakes in runtime deps, policies, and security patches.

**Deployment options**: Local install via `install.sh` (installs Node.js 22 via nvm, runs `npm install`, launches `nemoclaw onboard` wizard); remote GPU via Brev (`nemoclaw deploy <instance>`); DGX Spark/Station playbooks. Auxiliary services include Telegram bridge and cloudflared tunnel, managed via `nemoclaw start/stop/status`.

**Prerequisites**: Linux Ubuntu 22.04+, Docker, NVIDIA OpenShell. Full sandbox features (Landlock, seccomp) are **Linux-only** — macOS uses best-effort degradation.

---

## What this means for the NEURAL-CLAW merge

NemoClaw and NEURAL-CLAW occupy **completely different layers of the stack** — they are complementary, not overlapping. Here is the precise merge map:

**NEURAL-CLAW provides**: React orchestration canvas, brain-modeled multi-agent coordination, MIZU ternary dialectical governance, visual pipeline builder, Ollama local inference integration. These are **agent-level and UI-level concerns**.

**NemoClaw provides**: Sandboxed execution environment, declarative security policy engine, controlled inference routing, enterprise deployment tooling, supply-chain-safe blueprint system. These are **infrastructure-level and security-level concerns**.

The merge is not a feature merge — it is a **layer integration**. NEURAL-CLAW sits above NemoClaw in the stack. The React app consumes the OpenClaw WebSocket API for agent interaction, the NemoClaw policy proxy for security controls, and NIM/Ollama endpoints for inference. NemoClaw's sandbox runs the agents NEURAL-CLAW orchestrates. MIZU governance can enforce policies through NemoClaw's hot-reloadable YAML policy system.

The non-destructive path: keep NEURAL-CLAW's React frontend and orchestration logic intact, keep NemoClaw's TypeScript plugin and Python blueprint intact, and connect them through the existing WebSocket + REST interfaces. No codebase surgery required — both projects are designed to be composed, not merged at the source level.