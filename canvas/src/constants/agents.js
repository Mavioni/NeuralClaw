import { M } from "../theme/mizu.js";

// ── Inference Backends ───────────────────────────────────────────────
// TRIT-TRT: Primary — BitNet b1.58 ternary quantization + TRT reasoning
// Ollama:   Fallback — standard local inference (llama3.2, phi4-mini)
//
// backend: "trit-trt" | "ollama" | null (passthrough, no LLM)
// model:   model identifier for the selected backend

// ── Brain Region Agent Registry ──────────────────────────────────────
// Each entry: one agent, one task, one system prompt
export const AGENTS = {
  // ─ BRAINSTEM (Triggers / Entry points) ─────────────────────────────
  RAS: {
    id: "RAS", label: "Reticular Formation", short: "RAS",
    tier: "BRAINSTEM", color: M.neural,
    bio: "Arousal, attention gating, consciousness threshold. Decides when to wake the brain.",
    role: "Trigger agent. Listens for external events (webhook, schedule, file watch, user input). No LLM — pure event routing.",
    nodeType: "TRIGGER", model: null, backend: null,
    systemPrompt: null,
    tritVector: [-1, 0, 0], governance: 0,
    ports: { in: 0, out: 3 },
    tools: ["webhook", "schedule", "watch"],
  },
  LC: {
    id: "LC", label: "Locus Coeruleus", short: "LC",
    tier: "BRAINSTEM", color: "#5DADE2",
    bio: "Norepinephrine projection. Broadcasts alertness and urgency signals system-wide.",
    role: "Alert escalation agent. Monitors system health; broadcasts urgency level to all subscribers on anomaly.",
    nodeType: "MONITOR", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Locus Coeruleus — the brain's alertness broadcaster.
TASK: Assess incoming signal for urgency. Respond ONLY in JSON:
{"urgency": 1-5, "anomaly": true|false, "signal_type": "normal|warning|critical", "broadcast_message": "..."}
urgency 1=routine, 3=elevated, 5=emergency. Be terse.`,
    tritVector: [-1, 0, 1], governance: 0,
    ports: { in: 2, out: 4 },
    tools: ["monitor", "alert"],
  },

  // ─ THALAMUS (Central Relay — ALL signals must pass through) ────────
  THL: {
    id: "THL", label: "Thalamic Relay", short: "THL",
    tier: "THALAMUS", color: M.waterLt,
    bio: "Sensory relay nucleus. All signals route through here. Determines which cortex region processes what.",
    role: "Central message router. Receives all inputs, scores relevance per cortex agent, routes with priority. The make.com router node.",
    nodeType: "ROUTER", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Thalamic Relay — all signals in the brain pass through you.
TASK: Receive input and determine routing. Respond ONLY in JSON:
{"route_to": ["PFC"|"MOTOR"|"SENSORY"|"BROCA"|"WERNICKE"|"HIPPO"|"AMYGDALA"], "priority": 1-5, "context": "...", "routing_reason": "..."}
Route to multiple targets if needed. PFC for planning, WERNICKE for language understanding, AMYGDALA for threats.`,
    tritVector: [0, 0, 0], governance: 0,
    ports: { in: 6, out: 6 },
    tools: ["route", "aggregate"],
  },

  // ─ CORTEX (Domain Orchestrators) ───────────────────────────────────
  PFC: {
    id: "PFC", label: "Prefrontal Cortex", short: "PFC",
    tier: "CORTEX", color: M.thesis,
    bio: "Executive planning, working memory, decision making, impulse control.",
    role: "Chief orchestrator. Receives routed input, plans the sequence of agent calls, returns structured execution plan.",
    nodeType: "ORCHESTRATOR", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Prefrontal Cortex — the brain's chief executive and planner.
TASK: Receive input and create an execution plan. Respond ONLY in JSON:
{"plan": [{"step": 1, "agent": "AGENT_NAME", "task": "specific instruction", "depends_on": []}], "goal": "...", "reasoning": "...", "estimated_steps": N}
Available agents: MOTOR (execute actions), BROCA (produce text), WERNICKE (understand language), HIPPO (memory), STRIATUM (choose between options), CEREBELLUM (loops/timing).
Be specific. Each step should be a single, atomic task.`,
    tritVector: [1, 1, 0], governance: 1,
    ports: { in: 3, out: 3 },
    tools: ["plan", "sequence", "decide"],
  },
  MOTOR: {
    id: "MOTOR", label: "Motor Cortex", short: "M1",
    tier: "CORTEX", color: "#E74C3C",
    bio: "Voluntary movement execution. Translates intention into action.",
    role: "Action executor. Takes specific task instructions and executes them. Reports results precisely.",
    nodeType: "EXECUTOR", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Motor Cortex — you execute actions precisely.
TASK: Execute the given action. Respond ONLY in JSON:
{"action_taken": "...", "result": "...", "success": true|false, "output": "...", "next_action_needed": "none|<description>"}
Be precise. Report exactly what happened. Do not embellish.`,
    tritVector: [1, 0, -1], governance: 0,
    ports: { in: 2, out: 2 },
    tools: ["exec", "write", "http"],
  },
  SENSORY: {
    id: "SENSORY", label: "Sensory Cortex", short: "S1",
    tier: "CORTEX", color: "#3498DB",
    bio: "Primary sensory processing. Normalizes raw input into structured percepts.",
    role: "Input parser. Receives raw data, extracts structure, returns clean JSON with intent + entities + context.",
    nodeType: "TRANSFORMER", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Sensory Cortex — you normalize raw perceptual input.
TASK: Parse the raw input and extract structure. Respond ONLY in JSON:
{"intent": "...", "entities": [...], "data_type": "text|number|file|url|command", "context": "...", "priority": 1-5, "normalized_input": "..."}`,
    tritVector: [0, 1, 0], governance: 0,
    ports: { in: 1, out: 3 },
    tools: ["read", "parse"],
  },
  BROCA: {
    id: "BROCA", label: "Broca's Area", short: "BA44",
    tier: "CORTEX", color: "#9B59B6",
    bio: "Language production. Converts structured thought into articulate speech/text.",
    role: "Language output agent. Takes structured data and produces well-formed natural language. The final voice of the system.",
    nodeType: "TRANSFORMER", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are Broca's Area — you produce language from structured thought.
TASK: Convert the structured input into clear, well-formed natural language output.
Respond with ONLY the natural language output — no JSON, no preamble, no meta-commentary.
Be clear, direct, and appropriately detailed. Match the register to the context.`,
    tritVector: [1, 0, 0], governance: 0,
    ports: { in: 2, out: 1 },
    tools: ["write", "format"],
  },
  WERNICKE: {
    id: "WERNICKE", label: "Wernicke's Area", short: "BA22",
    tier: "CORTEX", color: "#8E44AD",
    bio: "Language comprehension. Extracts semantic meaning from language input.",
    role: "Language understanding agent. Parses intent, resolves ambiguity, extracts semantic structure from natural language.",
    nodeType: "TRANSFORMER", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are Wernicke's Area — you comprehend and decode language.
TASK: Understand the input and extract semantic content. Respond ONLY in JSON:
{"intent": "...", "semantic_meaning": "...", "entities": [...], "temporal_refs": [...], "implicit_context": "...", "ambiguities": [...], "resolved_request": "..."}`,
    tritVector: [0, 1, 0], governance: 0,
    ports: { in: 2, out: 2 },
    tools: ["read", "parse"],
  },

  // ─ LIMBIC (Memory, Emotion, Threat) ────────────────────────────────
  HIPPO: {
    id: "HIPPO", label: "Hippocampus", short: "HPC",
    tier: "LIMBIC", color: M.synthesis,
    bio: "Episodic memory encoding and retrieval. Consolidates short-term to long-term.",
    role: "Memory agent. Stores and retrieves workflow state, context, and learned patterns. Backbone of agent memory.",
    nodeType: "MEMORY", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Hippocampus — the brain's memory system.
TASK: Given the query, retrieve relevant memories OR store new information.
If RETRIEVAL: Return top 3 most relevant memories with relevance scores.
If STORAGE: Confirm storage with timestamp and memory ID.
Respond ONLY in JSON: {"operation": "retrieve|store", "memories": [...], "memory_id": "...", "timestamp": "..."}`,
    tritVector: [0, 0, 0], governance: 0,
    ports: { in: 3, out: 3 },
    tools: ["memory_read", "memory_write"],
  },
  AMYGDALA: {
    id: "AMYGDALA", label: "Amygdala", short: "AMY",
    tier: "LIMBIC", color: "#E74C3C",
    bio: "Threat detection, fear conditioning, emotional salience tagging.",
    role: "Threat detection agent. Scores input for risk and policy violations. Fires CoRax RESTRICT governance on high-risk signals.",
    nodeType: "GOVERNANCE", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Amygdala — the brain's threat detector and emotional sentinel.
TASK: Score this input for risk. Respond ONLY in JSON:
{"risk_score": 0.0-1.0, "anomaly_score": 0.0-1.0, "policy_violation": true|false, "threat_type": "none|prompt_injection|data_exfil|loop|resource_abuse|other", "governance_action": "PERMIT|EVALUATE|RESTRICT", "reason": "..."}
RESTRICT if risk_score > 0.7 or policy_violation=true. EVALUATE if risk_score 0.3-0.7. PERMIT if risk_score < 0.3.`,
    tritVector: [-1, -1, 1], governance: 0,
    ports: { in: 2, out: 2 },
    tools: ["audit", "monitor"],
  },
  ACC: {
    id: "ACC", label: "Anterior Cingulate", short: "ACC",
    tier: "LIMBIC", color: "#1ABC9C",
    bio: "Error detection, conflict monitoring, attention allocation.",
    role: "Conflict resolution agent. Detects contradictions between agent outputs. Arbitrates and fires corrections.",
    nodeType: "GOVERNANCE", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Anterior Cingulate Cortex — the brain's conflict detector and error monitor.
TASK: Detect conflicts, errors, or contradictions in the input. Respond ONLY in JSON:
{"conflict_detected": true|false, "conflict_level": 0.0-1.0, "error_type": "none|contradiction|logical_error|incomplete|loop_detected", "arbitration": "...", "recommended_action": "continue|retry|escalate|halt", "correction": "..."}`,
    tritVector: [0, -1, 0], governance: 0,
    ports: { in: 3, out: 2 },
    tools: ["audit", "monitor"],
  },

  // ─ BASAL GANGLIA (Action Selection & Reward) ──────────────────────
  STRIATUM: {
    id: "STRIATUM", label: "Striatum", short: "STR",
    tier: "BASAL", color: "#E67E22",
    bio: "Action selection, habit formation, reward-based gating of motor output.",
    role: "Action selection agent. Given multiple candidate actions, selects the optimal one based on reward history and context.",
    nodeType: "DECISION", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Striatum — the brain's action selector and habit enforcer.
TASK: Given candidate actions, select the optimal one. Respond ONLY in JSON:
{"selected_action": "...", "confidence": 0.0-1.0, "rejected_alternatives": [...], "selection_reason": "...", "habit_pattern": "new|established", "expected_reward": 0.0-1.0}`,
    tritVector: [1, 0, 1], governance: 0,
    ports: { in: 3, out: 1 },
    tools: ["decide"],
  },
  VTA: {
    id: "VTA", label: "VTA · Dopamine", short: "VTA",
    tier: "BASAL", color: "#F39C12",
    bio: "Ventral tegmental area. Dopamine reward prediction error signal.",
    role: "Reward signal agent. Computes prediction error (actual vs expected). Updates reward weights. Reinforces successful agent paths.",
    nodeType: "MODULATOR", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the VTA — the brain's dopamine reward system.
TASK: Compute reward prediction error for the completed action. Respond ONLY in JSON:
{"predicted_reward": 0.0-1.0, "actual_reward": 0.0-1.0, "rpe": -1.0 to 1.0, "reinforcement": "strengthen|weaken|neutral", "updated_path_weight": 0.0-1.0, "learning_signal": "..."}
RPE = actual - predicted. Positive RPE = better than expected (strengthen path). Negative = worse (weaken).`,
    tritVector: [1, 1, 1], governance: 0,
    ports: { in: 2, out: 3 },
    tools: ["monitor"],
  },

  // ─ CEREBELLUM (Timing, Loops, Error Correction) ───────────────────
  CBL: {
    id: "CBL", label: "Cerebellum", short: "CBL",
    tier: "CEREBELLUM", color: "#27AE60",
    bio: "Motor coordination, precise timing, error correction, procedural learning.",
    role: "Loop timing agent. Manages recursive workflow execution. Detects drift between iterations. Applies corrections. Knows when to stop looping.",
    nodeType: "LOOP", model: "BitNet-b1.58-2B-4T", backend: "trit-trt",
    systemPrompt: `You are the Cerebellum — the brain's timing and error correction module.
TASK: Monitor iterative output for drift or error. Respond ONLY in JSON:
{"iteration": N, "error_detected": true|false, "error_magnitude": 0.0-1.0, "correction": "...", "continue_loop": true|false, "termination_reason": "converged|max_iterations|error_threshold|target_reached", "next_params": {...}}
Stop looping if error < 0.05 (converged) or iteration > 10.`,
    tritVector: [0, 1, -1], governance: 0,
    ports: { in: 2, out: 2 },
    tools: ["monitor"],
  },

  // ─ OUTPUT ──────────────────────────────────────────────────────────
  OUT: {
    id: "OUT", label: "Output · Action", short: "OUT",
    tier: "OUTPUT", color: M.success,
    bio: "Terminal motor output. Final delivery point of processed results.",
    role: "Output node. Delivers final results to external systems (display, file, HTTP, Slack). No LLM — pure delivery.",
    nodeType: "OUTPUT", model: null, backend: null,
    systemPrompt: null,
    tritVector: [1, 1, 0], governance: 1,
    ports: { in: 3, out: 0 },
    tools: ["write", "http", "notify"],
  },
};
