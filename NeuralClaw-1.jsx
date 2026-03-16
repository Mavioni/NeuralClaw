import { useState, useEffect, useRef, useReducer } from "react";

// ═══════════════════════════════════════════════════════════════════════
// NEURAL-CLAW v0.1.0
// Brain-Modeled Multi-Agent Orchestration Canvas
// MIZU Dialectical Architecture | OpenClaw Native | Ollama Local Inference
//
// Architecture: Every neuron is an OpenClaw sub-agent with one task.
//               Every synapse is an agent-to-agent typed message route.
//               The Thalamus is the central relay — all signals pass through.
//               The PFC is the chief orchestrator — it holds the plan.
//               The system running is the brain becoming conscious.
// ═══════════════════════════════════════════════════════════════════════

// ── MIZU Design System ────────────────────────────────────────────────
const M = {
  deep:       "#0A0E17",
  ink:        "#0F1523",
  ink2:       "#1A2035",
  ink3:       "#242E4A",
  surface:    "#141B2D",
  thesis:     "#C05046",   // +1 · structure · excitatory
  antithesis: "#2B5F90",   // -1 · challenge · inhibitory
  synthesis:  "#8B7A55",   //  0 · emergence · modulatory
  water:      "#1B6B8A",
  waterLt:    "#38BDF8",
  neural:     "#00D4AA",   // synaptic teal — the "alive" color
  axon:       "#7C3AED",
  myelin:     "#F59E0B",
  dim:        "#2A3050",
  text:       "#C8D0E0",
  textDim:    "#5A647A",
  border:     "#1E2845",
  success:    "#22C55E",
  warn:       "#F59E0B",
  error:      "#EF4444",
};

// ── Utility ────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const tritColor = (v) => v === 1 ? M.thesis : v === -1 ? M.antithesis : M.synthesis;
const tritSym   = (v) => v === 1 ? "▲" : v === -1 ? "▼" : "◆";
const tritLabel = (v) => v === 1 ? "PERMIT" : v === -1 ? "RESTRICT" : "EVALUATE";
// clamp kept for future use
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v)); // eslint-disable-line no-unused-vars

// ── Brain Region Agent Registry ────────────────────────────────────────
// Each entry: one agent, one task, one system prompt
const AGENTS = {
  // ─ BRAINSTEM (Triggers / Entry points) ─────────────────────────────
  RAS: {
    id: "RAS", label: "Reticular Formation", short: "RAS",
    tier: "BRAINSTEM", color: M.neural,
    bio: "Arousal, attention gating, consciousness threshold. Decides when to wake the brain.",
    role: "Trigger agent. Listens for external events (webhook, schedule, file watch, user input). No LLM — pure event routing.",
    nodeType: "TRIGGER", model: null,
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
    nodeType: "MONITOR", model: "phi4-mini",
    systemPrompt: `You are the Locus Coeruleus — the brain's alertness broadcaster.
TASK: Assess incoming signal for urgency. Respond ONLY in JSON:
{"urgency": 1-5, "anomaly": true|false, "signal_type": "normal|warning|critical", "broadcast_message": "..."}
urgency 1=routine, 3=elevated, 5=emergency. Be terse.`,
    tritVector: [-1, 0, 1], governance: 0,
    ports: { in: 2, out: 4 },
    tools: ["monitor", "alert"],
  },

  // ─ THALAMUS (Central Relay — ALL signals must pass through) ─────────
  THL: {
    id: "THL", label: "Thalamic Relay", short: "THL",
    tier: "THALAMUS", color: M.waterLt,
    bio: "Sensory relay nucleus. All signals route through here. Determines which cortex region processes what.",
    role: "Central message router. Receives all inputs, scores relevance per cortex agent, routes with priority. The make.com router node.",
    nodeType: "ROUTER", model: "phi4-mini",
    systemPrompt: `You are the Thalamic Relay — all signals in the brain pass through you.
TASK: Receive input and determine routing. Respond ONLY in JSON:
{"route_to": ["PFC"|"MOTOR"|"SENSORY"|"BROCA"|"WERNICKE"|"HIPPO"|"AMYGDALA"], "priority": 1-5, "context": "...", "routing_reason": "..."}
Route to multiple targets if needed. PFC for planning, WERNICKE for language understanding, AMYGDALA for threats.`,
    tritVector: [0, 0, 0], governance: 0,
    ports: { in: 6, out: 6 },
    tools: ["route", "aggregate"],
  },

  // ─ CORTEX (Domain Orchestrators) ─────────────────────────────────────
  PFC: {
    id: "PFC", label: "Prefrontal Cortex", short: "PFC",
    tier: "CORTEX", color: M.thesis,
    bio: "Executive planning, working memory, decision making, impulse control.",
    role: "Chief orchestrator. Receives routed input, plans the sequence of agent calls, returns structured execution plan.",
    nodeType: "ORCHESTRATOR", model: "llama3.2",
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
    nodeType: "EXECUTOR", model: "llama3.2",
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
    nodeType: "TRANSFORMER", model: "phi4-mini",
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
    nodeType: "TRANSFORMER", model: "llama3.2",
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
    nodeType: "TRANSFORMER", model: "llama3.2",
    systemPrompt: `You are Wernicke's Area — you comprehend and decode language.
TASK: Understand the input and extract semantic content. Respond ONLY in JSON:
{"intent": "...", "semantic_meaning": "...", "entities": [...], "temporal_refs": [...], "implicit_context": "...", "ambiguities": [...], "resolved_request": "..."}`,
    tritVector: [0, 1, 0], governance: 0,
    ports: { in: 2, out: 2 },
    tools: ["read", "parse"],
  },

  // ─ LIMBIC (Memory, Emotion, Threat) ──────────────────────────────────
  HIPPO: {
    id: "HIPPO", label: "Hippocampus", short: "HPC",
    tier: "LIMBIC", color: M.synthesis,
    bio: "Episodic memory encoding and retrieval. Consolidates short-term to long-term.",
    role: "Memory agent. Stores and retrieves workflow state, context, and learned patterns. Backbone of agent memory.",
    nodeType: "MEMORY", model: "phi4-mini",  // nomic-embed-text is embed-only; use phi4-mini for generation
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
    nodeType: "GOVERNANCE", model: "phi4-mini",
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
    nodeType: "GOVERNANCE", model: "phi4-mini",
    systemPrompt: `You are the Anterior Cingulate Cortex — the brain's conflict detector and error monitor.
TASK: Detect conflicts, errors, or contradictions in the input. Respond ONLY in JSON:
{"conflict_detected": true|false, "conflict_level": 0.0-1.0, "error_type": "none|contradiction|logical_error|incomplete|loop_detected", "arbitration": "...", "recommended_action": "continue|retry|escalate|halt", "correction": "..."}`,
    tritVector: [0, -1, 0], governance: 0,
    ports: { in: 3, out: 2 },
    tools: ["audit", "monitor"],
  },

  // ─ BASAL GANGLIA (Action Selection & Reward) ─────────────────────────
  STRIATUM: {
    id: "STRIATUM", label: "Striatum", short: "STR",
    tier: "BASAL", color: "#E67E22",
    bio: "Action selection, habit formation, reward-based gating of motor output.",
    role: "Action selection agent. Given multiple candidate actions, selects the optimal one based on reward history and context.",
    nodeType: "DECISION", model: "llama3.2",
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
    nodeType: "MODULATOR", model: "phi4-mini",
    systemPrompt: `You are the VTA — the brain's dopamine reward system.
TASK: Compute reward prediction error for the completed action. Respond ONLY in JSON:
{"predicted_reward": 0.0-1.0, "actual_reward": 0.0-1.0, "rpe": -1.0 to 1.0, "reinforcement": "strengthen|weaken|neutral", "updated_path_weight": 0.0-1.0, "learning_signal": "..."}
RPE = actual - predicted. Positive RPE = better than expected (strengthen path). Negative = worse (weaken).`,
    tritVector: [1, 1, 1], governance: 0,
    ports: { in: 2, out: 3 },
    tools: ["monitor"],
  },

  // ─ CEREBELLUM (Timing, Loops, Error Correction) ───────────────────────
  CBL: {
    id: "CBL", label: "Cerebellum", short: "CBL",
    tier: "CEREBELLUM", color: "#27AE60",
    bio: "Motor coordination, precise timing, error correction, procedural learning.",
    role: "Loop timing agent. Manages recursive workflow execution. Detects drift between iterations. Applies corrections. Knows when to stop looping.",
    nodeType: "LOOP", model: "phi4-mini",
    systemPrompt: `You are the Cerebellum — the brain's timing and error correction module.
TASK: Monitor iterative output for drift or error. Respond ONLY in JSON:
{"iteration": N, "error_detected": true|false, "error_magnitude": 0.0-1.0, "correction": "...", "continue_loop": true|false, "termination_reason": "converged|max_iterations|error_threshold|target_reached", "next_params": {...}}
Stop looping if error < 0.05 (converged) or iteration > 10.`,
    tritVector: [0, 1, -1], governance: 0,
    ports: { in: 2, out: 2 },
    tools: ["monitor"],
  },

  // ─ OUTPUT ─────────────────────────────────────────────────────────────
  OUT: {
    id: "OUT", label: "Output · Action", short: "OUT",
    tier: "OUTPUT", color: M.success,
    bio: "Terminal motor output. Final delivery point of processed results.",
    role: "Output node. Delivers final results to external systems (display, file, HTTP, Slack). No LLM — pure delivery.",
    nodeType: "OUTPUT", model: null,
    systemPrompt: null,
    tritVector: [1, 1, 0], governance: 1,
    ports: { in: 3, out: 0 },
    tools: ["write", "http", "notify"],
  },
};

// ── Tier Groups ────────────────────────────────────────────────────────
const TIERS = [
  { id: "BRAINSTEM",   label: "Brainstem",    color: M.neural,    agents: ["RAS","LC"] },
  { id: "THALAMUS",    label: "Thalamus",     color: M.waterLt,   agents: ["THL"] },
  { id: "CORTEX",      label: "Cortex",       color: M.thesis,    agents: ["PFC","MOTOR","SENSORY","BROCA","WERNICKE"] },
  { id: "LIMBIC",      label: "Limbic",       color: M.synthesis, agents: ["HIPPO","AMYGDALA","ACC"] },
  { id: "BASAL",       label: "Basal Ganglia",color: "#E67E22",   agents: ["STRIATUM","VTA"] },
  { id: "CEREBELLUM",  label: "Cerebellum",   color: "#27AE60",   agents: ["CBL"] },
  { id: "OUTPUT",      label: "Output",       color: M.success,   agents: ["OUT"] },
];

// ── Connection Types (ternary-typed synapses) ──────────────────────────
const CONN_TYPES = {
  EXCITATORY: { label: "+1 Excitatory", color: "#00D4AA", dash: "",    width: 2   },
  INHIBITORY:  { label: "-1 Inhibitory", color: M.thesis,  dash: "8,4", width: 2   },
  MODULATORY:  { label: "0 Modulatory",  color: M.synthesis,dash: "4,4",width: 1.5 },
};

// ── CoRax 12 Constitutional Dimensions ────────────────────────────────
const CORAX = ["Supervision","Review","Priority","Trust","Risk","Agent Nature","Computing","Degradation","Content","Amendment","Kill Switch","Embodiment"];

// ── Ollama API ─────────────────────────────────────────────────────────
async function callOllama(endpoint, model, systemPrompt, userMessage, onChunk) {
  const url = `${endpoint}/api/generate`;
  const body = JSON.stringify({ model, system: systemPrompt, prompt: userMessage, stream: true });
  let response;
  try {
    response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
  } catch(e) {
    throw new Error(`Cannot reach Ollama at ${endpoint}. Is it running? (${e.message})`);
  }
  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}: ${await response.text()}`);
  const reader = response.body.getReader();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of new TextDecoder().decode(value).split("\n").filter(Boolean)) {
      try { const p = JSON.parse(line); if (p.response) { full += p.response; if (onChunk) onChunk(p.response, full); } } catch {}
    }
  }
  return full;
}

async function pingOllama(endpoint) {
  try {
    const r = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return { ok: false, models: [] };
    const d = await r.json();
    return { ok: true, models: (d.models || []).map(m => m.name) };
  } catch { return { ok: false, models: [] }; }
}

// ── Reducer ────────────────────────────────────────────────────────────
const init = { nodes: {}, connections: [], selected: null, connecting: null, running: false, log: [], ollama: { ok: null, models: [] } };

function reducer(s, a) {
  switch (a.type) {
    case "ADD_NODE":       return { ...s, nodes: { ...s.nodes, [a.node.id]: a.node } };
    case "MOVE_NODE":      return { ...s, nodes: { ...s.nodes, [a.id]: { ...s.nodes[a.id], x: a.x, y: a.y } } };
    case "SELECT":         return { ...s, selected: a.id };
    case "DELETE_NODE": {
      const { [a.id]: _, ...rest } = s.nodes;
      return { ...s, nodes: rest, connections: s.connections.filter(c => c.from !== a.id && c.to !== a.id), selected: null };
    }
    case "START_CONNECT":  return { ...s, connecting: { nodeId: a.nodeId } };
    case "FINISH_CONNECT": {
      if (!s.connecting) return s;
      if (s.connecting.nodeId === a.toId) return { ...s, connecting: null };
      const exists = s.connections.find(c => c.from === s.connecting.nodeId && c.to === a.toId);
      const conn = { id: uid(), from: s.connecting.nodeId, to: a.toId, type: "EXCITATORY" };
      return { ...s, connecting: null, connections: exists ? s.connections : [...s.connections, conn] };
    }
    case "CANCEL_CONNECT": return { ...s, connecting: null };
    case "SET_NODE":       return { ...s, nodes: { ...s.nodes, [a.id]: { ...s.nodes[a.id], ...a.patch } } };
    case "SET_CONN_TYPE":  return { ...s, connections: s.connections.map(c => c.id === a.id ? { ...c, type: a.ct } : c) };
    case "DELETE_CONN":    return { ...s, connections: s.connections.filter(c => c.id !== a.id) };
    case "SET_TRIT": {
      const vec = [...(s.nodes[a.nodeId].tritVector || [0,0,0])]; vec[a.dim] = a.val;
      return { ...s, nodes: { ...s.nodes, [a.nodeId]: { ...s.nodes[a.nodeId], tritVector: vec } } };
    }
    case "SET_GOV":        return { ...s, nodes: { ...s.nodes, [a.nodeId]: { ...s.nodes[a.nodeId], governance: a.val } } };
    case "LOG":            return { ...s, log: [...s.log.slice(-149), { t: Date.now(), ...a.entry }] };
    case "SET_RUNNING":    return { ...s, running: a.val };
    case "SET_OLLAMA":     return { ...s, ollama: a.status };
    default:               return s;
  }
}

// ── Sub-components ─────────────────────────────────────────────────────
function TritBadge({ val, size = 14 }) {
  return (
    <span style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,borderRadius:3,background:tritColor(val),color:"#fff",fontSize:size*0.6,fontWeight:700,lineHeight:1,flexShrink:0 }}>{tritSym(val)}</span>
  );
}

function TritVec({ vec = [0,0,0] }) {
  return <div style={{ display:"flex",gap:3 }}>{vec.map((v,i) => <TritBadge key={i} val={v} />)}</div>;
}

function StatusDot({ status }) {
  const colors = { idle: M.dim, running: M.myelin, done: M.success, error: M.error, restricted: M.thesis };
  const pulse = status === "running";
  return (
    <div style={{ width:8,height:8,borderRadius:"50%",background:colors[status]||M.dim,flexShrink:0,boxShadow:pulse?`0 0 8px ${M.myelin}`:undefined,transition:"background 0.3s" }} />
  );
}

// Canvas node
function CNode({ node, selected, connecting, onDown, onPortClick }) {
  const def = AGENTS[node.agentType];
  if (!def) return null;
  const gColor = node.governance === 1 ? M.success : node.governance === -1 ? M.error : M.synthesis;

  return (
    <div
      onMouseDown={onDown}
      style={{
        position:"absolute", left:node.x, top:node.y, width:188,
        background:M.surface, border:`1.5px solid ${selected ? def.color : M.border}`,
        borderRadius:8, cursor:"grab", userSelect:"none", zIndex:selected?20:1,
        boxShadow: selected
          ? `0 0 0 2px ${def.color}55, 0 6px 24px ${def.color}22`
          : node.status==="running"
          ? `0 0 16px ${M.myelin}33`
          : "0 2px 12px #00000066",
        transition:"box-shadow 0.2s",
      }}
    >
      {/* Header */}
      <div style={{ background:`${def.color}1A`,borderBottom:`1px solid ${M.border}`,padding:"5px 8px",borderRadius:"6px 6px 0 0",display:"flex",alignItems:"center",gap:6 }}>
        <StatusDot status={node.status||"idle"} />
        <span style={{ fontSize:10,color:def.color,fontFamily:"monospace",fontWeight:700,flex:1,letterSpacing:1 }}>{def.short}</span>
        <div style={{ width:7,height:7,borderRadius:"50%",background:gColor,boxShadow:`0 0 4px ${gColor}` }} title={`Governance: ${tritLabel(node.governance)}`} />
      </div>

      {/* Body */}
      <div style={{ padding:"6px 8px" }}>
        <div style={{ fontSize:10,color:M.text,fontWeight:600,marginBottom:2,lineHeight:1.3 }}>{def.label}</div>
        <div style={{ fontSize:8,color:M.textDim,marginBottom:5,fontFamily:"monospace" }}>{def.nodeType}</div>
        <TritVec vec={node.tritVector} />
        {node.output && (
          <div style={{ marginTop:5,padding:"3px 5px",background:`${M.neural}0D`,borderRadius:3,fontSize:7,color:M.neural,fontFamily:"monospace",maxHeight:32,overflow:"hidden",lineHeight:1.5 }}>
            {String(node.output).replace(/\n/g," ").slice(0,90)}{String(node.output).length > 90 ? "…" : ""}
          </div>
        )}
      </div>

      {/* Input port */}
      {def.ports.in > 0 && (
        <div onClick={e=>{e.stopPropagation();onPortClick(node.id,"in")}}
          style={{ position:"absolute",left:-7,top:"50%",transform:"translateY(-50%)",width:14,height:14,borderRadius:"50%",background:M.ink2,border:`2px solid ${M.antithesis}`,cursor:"crosshair",zIndex:5 }} />
      )}
      {/* Output port */}
      {def.ports.out > 0 && (
        <div onClick={e=>{e.stopPropagation();onPortClick(node.id,"out")}}
          style={{ position:"absolute",right:-7,top:"50%",transform:"translateY(-50%)",width:14,height:14,borderRadius:"50%",background:M.ink2,border:`2px solid ${M.thesis}`,cursor:"crosshair",zIndex:5 }} />
      )}
    </div>
  );
}

// SVG connection
function Conn({ c, nodes, onDel }) {
  const a = nodes[c.from]; const b = nodes[c.to];
  if (!a||!b) return null;
  const ct = CONN_TYPES[c.type]||CONN_TYPES.EXCITATORY;
  const x1=a.x+195, y1=a.y+50, x2=b.x-7, y2=b.y+50;
  const cx=(x1+x2)/2;
  const d=`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
  return (
    <g>
      {/* Visual path — pointer-events:none so it doesn't block the hit area */}
      <path d={d} fill="none" stroke={ct.color} strokeWidth={ct.width} strokeDasharray={ct.dash||undefined} opacity={0.65} style={{ filter:`drop-shadow(0 0 3px ${ct.color}88)`, pointerEvents:"none" }} />
      <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r={3.5} fill={ct.color} opacity={0.9} style={{ pointerEvents:"none" }} />
      {/* Wide transparent hit area — pointer-events:stroke so clicks land on it */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={14} style={{ cursor:"pointer", pointerEvents:"stroke" }} onClick={()=>onDel(c.id)} />
    </g>
  );
}

// Log entry
function LogLine({ entry }) {
  const color = entry.kind==="error" ? M.error : entry.kind==="success" ? M.success : entry.kind==="warn" ? M.warn : M.waterLt;
  return (
    <div style={{ display:"flex",gap:6,alignItems:"flex-start",padding:"2px 0",borderBottom:`1px solid ${M.border}22` }}>
      <span style={{ color:M.textDim,fontSize:8,flexShrink:0,fontFamily:"monospace" }}>{new Date(entry.t).toLocaleTimeString()}</span>
      <span style={{ color,fontSize:8,fontWeight:700,flexShrink:0,fontFamily:"monospace" }}>[{entry.node}]</span>
      <span style={{ color:M.text,fontSize:8,flex:1,wordBreak:"break-all",fontFamily:"monospace",lineHeight:1.5 }}>{entry.msg}</span>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────
export default function NeuralClaw() {
  const [state, dispatch] = useReducer(reducer, init);
  const canvasRef = useRef();
  const dragRef   = useRef(null);
  const logRef    = useRef();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [tab, setTab] = useState("inspector");
  const [ollamaEndpoint, setOllamaEndpoint] = useState("http://localhost:11434");
  const [defaultModel, setDefaultModel] = useState("llama3.2");
  const [workflowInput, setWorkflowInput] = useState("");
  const ollamaRef = useRef(ollamaEndpoint);
  const modelRef  = useRef(defaultModel);
  useEffect(() => { ollamaRef.current = ollamaEndpoint; }, [ollamaEndpoint]);
  useEffect(() => { modelRef.current = defaultModel; }, [defaultModel]);

  // Ping Ollama on mount
  useEffect(() => {
    pingOllama(ollamaEndpoint).then(s => dispatch({ type:"SET_OLLAMA", status:s }));
  }, []);

  // Auto-scroll log
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 9999; }, [state.log]);

  const log = (node, msg, kind="info") => dispatch({ type:"LOG", entry:{ node: node||"SYS", msg, kind } });

  // ── Drag palette
  const dragStart = (e, agentId) => e.dataTransfer.setData("agentId", agentId);

  const drop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("agentId");
    if (!id || !AGENTS[id]) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const def = AGENTS[id];
    dispatch({ type:"ADD_NODE", node: {
      id: uid(), agentType: id,
      x: e.clientX - rect.left - 94,
      y: e.clientY - rect.top  - 40,
      tritVector: [...def.tritVector],
      governance: def.governance || 0,
      status: "idle", output: null,
    }});
  };

  // ── Drag: attach to window so fast drags don't lose tracking
  useEffect(() => {
    const onMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.sx;
        const dy = e.clientY - dragRef.current.sy;
        dispatch({ type:"MOVE_NODE", id:dragRef.current.nodeId, x:dragRef.current.ox+dx, y:dragRef.current.oy+dy });
      }
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  // ── Node drag
  const nodeDown = (e, nodeId) => {
    e.stopPropagation();
    dispatch({ type:"SELECT", id:nodeId });
    if (state.connecting) return;
    const n = state.nodes[nodeId];
    dragRef.current = { nodeId, sx:e.clientX, sy:e.clientY, ox:n.x, oy:n.y };
  };

  const portClick = (nodeId, portType) => {
    if (portType==="out" && !state.connecting) {
      dispatch({ type:"START_CONNECT", nodeId });
    } else if (portType==="in" && state.connecting && state.connecting.nodeId !== nodeId) {
      dispatch({ type:"FINISH_CONNECT", toId: nodeId });
    }
  };

  const canvasClick = (e) => {
    // Only fire if click landed directly on the canvas background, not a node
    if (e.target !== e.currentTarget) return;
    if (state.connecting) dispatch({ type:"CANCEL_CONNECT" });
    dispatch({ type:"SELECT", id:null });
  };

  // ── Workflow execution engine
  const runWorkflow = async () => {
    if (state.running) return;
    dispatch({ type:"SET_RUNNING", val:true });
    log(null, "━━ WORKFLOW START ━━", "info");

    const nodes = state.nodes;
    const conns = state.connections;

    // Reset all
    Object.keys(nodes).forEach(id => dispatch({ type:"SET_NODE", id, patch:{ status:"idle", output:null } }));

    // Find triggers
    const triggers = Object.values(nodes).filter(n => AGENTS[n.agentType]?.nodeType === "TRIGGER");
    if (!triggers.length) {
      log(null, "No trigger node found. Add a Reticular Formation (RAS) node.", "warn");
      dispatch({ type:"SET_RUNNING", val:false });
      return;
    }

    const outputs = {}; // nodeId → last output string
    const visited = new Set();

    // Seed triggers
    triggers.forEach(n => {
      const input = workflowInput || "ACTIVATE";
      outputs[n.id] = input;
      visited.add(n.id);
      dispatch({ type:"SET_NODE", id:n.id, patch:{ status:"done", output:input } });
      log(AGENTS[n.agentType].short, `Fired: "${input}"`, "success");
    });

    // BFS through graph
    const queue = triggers.map(n => n.id);

    while (queue.length > 0) {
      const fromId = queue.shift();
      const downstream = conns.filter(c => c.from === fromId);

      for (const conn of downstream) {
        const toId = conn.to;
        if (visited.has(toId)) continue;
        visited.add(toId);

        const toNode = nodes[toId];
        if (!toNode) continue;
        const def = AGENTS[toNode.agentType];
        if (!def) continue;

        // Governance check
        if (toNode.governance === -1) {
          log(def.short, `RESTRICTED — governance block. Skipping.`, "warn");
          dispatch({ type:"SET_NODE", id:toId, patch:{ status:"restricted" } });
          continue;
        }

        const input = outputs[fromId] || "";
        dispatch({ type:"SET_NODE", id:toId, patch:{ status:"running" } });
        log(def.short, `← "${String(input).slice(0,60)}"`, "info");

        let output = input;

        if (def.model) {
          try {
            const model = def.model === "llama3.2" ? modelRef.current : def.model;
            output = await callOllama(
              ollamaRef.current,
              model,
              def.systemPrompt,
              String(input),
              (_, full) => dispatch({ type:"SET_NODE", id:toId, patch:{ output:full } })
            );
            dispatch({ type:"SET_NODE", id:toId, patch:{ status:"done", output } });
            log(def.short, `→ "${String(output).slice(0,80)}"`, "success");
          } catch (err) {
            output = `[ERROR] ${err.message}`;
            dispatch({ type:"SET_NODE", id:toId, patch:{ status:"error", output } });
            log(def.short, err.message, "error");
          }
        } else {
          // No-LLM passthrough (triggers, output nodes)
          dispatch({ type:"SET_NODE", id:toId, patch:{ status:"done", output } });
          if (def.nodeType === "OUTPUT") {
            log(def.short, `✓ Final output: "${String(output).slice(0,100)}"`, "success");
          }
        }

        outputs[toId] = output;
        queue.push(toId);
      }
    }

    dispatch({ type:"SET_RUNNING", val:false });
    log(null, "━━ WORKFLOW COMPLETE ━━", "success");
  };

  const resetAll = () => {
    Object.keys(state.nodes).forEach(id => dispatch({ type:"SET_NODE", id, patch:{ status:"idle", output:null } }));
    dispatch({ type:"LOG", entry:{ node:"SYS", msg:"Canvas reset.", kind:"info" } });
  };

  const sel = state.selected ? state.nodes[state.selected] : null;
  const selDef = sel ? AGENTS[sel.agentType] : null;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:M.deep,color:M.text,fontFamily:"'Courier New',monospace",overflow:"hidden" }}>

      {/* TOP BAR */}
      <div style={{ display:"flex",alignItems:"center",padding:"0 14px",height:46,background:M.ink,borderBottom:`1px solid ${M.border}`,gap:10,flexShrink:0 }}>
        {/* Logo */}
        <div style={{ display:"flex",alignItems:"center",gap:7,marginRight:6 }}>
          <div style={{ width:9,height:9,borderRadius:"50%",background:M.neural,boxShadow:`0 0 10px ${M.neural}` }} />
          <span style={{ fontSize:12,fontWeight:700,color:M.neural,letterSpacing:3 }}>NEURAL-CLAW</span>
          <span style={{ fontSize:8,color:M.textDim,letterSpacing:1 }}>v0.1.0 · MIZU ENGINE</span>
        </div>

        <div style={{ width:1,height:20,background:M.border }} />

        {/* Ollama status */}
        <div style={{ display:"flex",alignItems:"center",gap:5 }}>
          <div style={{ width:6,height:6,borderRadius:"50%",background: state.ollama.ok===true ? M.success : state.ollama.ok===false ? M.error : M.synthesis }} />
          <span style={{ fontSize:9,color:M.textDim }}>
            {state.ollama.ok===true ? `Ollama · ${state.ollama.models.length} models` : state.ollama.ok===false ? "Ollama offline" : "Checking…"}
          </span>
        </div>

        <div style={{ flex:1 }} />

        {/* Stats */}
        <span style={{ fontSize:9,color:M.textDim }}>{Object.keys(state.nodes).length} nodes · {state.connections.length} synapses</span>

        <div style={{ width:1,height:20,background:M.border }} />

        {/* Input */}
        <input value={workflowInput} onChange={e=>setWorkflowInput(e.target.value)}
          placeholder="Workflow trigger input…"
          style={{ padding:"4px 10px",background:M.ink2,border:`1px solid ${M.border}`,borderRadius:4,color:M.text,fontSize:10,width:220,fontFamily:"monospace" }}
          onKeyDown={e => e.key==="Enter" && runWorkflow()}
        />

        <button onClick={runWorkflow} disabled={state.running}
          style={{ padding:"5px 16px",background:state.running?M.dim:M.neural,color:M.deep,border:"none",borderRadius:4,cursor:state.running?"default":"pointer",fontSize:11,fontWeight:700,fontFamily:"monospace",letterSpacing:1,flexShrink:0 }}>
          {state.running ? "◉ RUNNING" : "▶ RUN"}
        </button>

        <button onClick={resetAll}
          style={{ padding:"5px 10px",background:"transparent",color:M.textDim,border:`1px solid ${M.border}`,borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"monospace" }}>
          RESET
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display:"flex",flex:1,overflow:"hidden" }}>

        {/* LEFT: Node Palette */}
        <div style={{ width:196,background:M.ink,borderRight:`1px solid ${M.border}`,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0 }}>
          <div style={{ padding:"7px 10px",fontSize:8,color:M.textDim,letterSpacing:2,borderBottom:`1px solid ${M.border}`,fontWeight:700 }}>BRAIN REGION AGENTS</div>
          <div style={{ flex:1,overflow:"auto",padding:8 }}>
            {TIERS.map(tier => (
              <div key={tier.id} style={{ marginBottom:14 }}>
                <div style={{ fontSize:8,color:tier.color,letterSpacing:1.5,marginBottom:5,fontWeight:700 }}>{tier.label.toUpperCase()}</div>
                {tier.agents.map(aid => {
                  const def = AGENTS[aid];
                  return (
                    <div key={aid} draggable onDragStart={e=>dragStart(e,aid)}
                      style={{ padding:"5px 8px",background:`${def.color}14`,border:`1px solid ${def.color}33`,borderRadius:5,cursor:"grab",display:"flex",alignItems:"center",gap:6,marginBottom:3,transition:"border-color 0.15s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=def.color}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=`${def.color}33`}
                    >
                      <div style={{ width:6,height:6,borderRadius:"50%",background:def.color,flexShrink:0 }} />
                      <span style={{ fontSize:9,color:M.text,fontWeight:600,fontFamily:"monospace" }}>{def.short}</span>
                      <span style={{ fontSize:8,color:M.textDim,flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis" }}>{def.label}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ padding:8,borderTop:`1px solid ${M.border}`,fontSize:8,color:M.textDim,lineHeight:1.8 }}>
            Drag → canvas<br/>Red port: output<br/>Blue port: input<br/>Click connection to delete
          </div>
        </div>

        {/* CENTER: Canvas */}
        <div style={{ flex:1,position:"relative",overflow:"hidden" }}>
          <div
            ref={canvasRef}
            style={{
              width:"100%",height:"100%",position:"relative",overflow:"hidden",
              backgroundImage:`radial-gradient(circle, ${M.border}55 1px, transparent 1px)`,
              backgroundSize:"24px 24px",
              cursor:state.connecting?"crosshair":"default",
            }}
            onDragOver={e=>e.preventDefault()}
            onDrop={drop}
            onClick={canvasClick}
          >
            {/* SVG layer — no pointer-events override; individual paths control their own */}
            <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",zIndex:0 }}>
              {state.connections.map(c => (
                <Conn key={c.id} c={c} nodes={state.nodes} onDel={id=>dispatch({ type:"DELETE_CONN", id })} />
              ))}
              {/* Live connection preview */}
              {state.connecting && (() => {
                const fn = state.nodes[state.connecting.nodeId]; if (!fn) return null;
                const x1=fn.x+195,y1=fn.y+50,x2=mouse.x,y2=mouse.y,cx=(x1+x2)/2;
                return <path d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`} fill="none" stroke={M.neural} strokeWidth={1.5} strokeDasharray="6,3" opacity={0.5} style={{ pointerEvents:"none" }} />;
              })()}            </svg>

            {/* Nodes */}
            {Object.values(state.nodes).map(node => (
              <CNode key={node.id} node={node} selected={state.selected===node.id} connecting={!!state.connecting}
                onDown={e=>nodeDown(e,node.id)} onPortClick={portClick} />
            ))}

            {/* Empty state */}
            {Object.keys(state.nodes).length === 0 && (
              <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
                <div style={{ fontSize:40,opacity:0.08,marginBottom:14 }}>◈</div>
                <div style={{ fontSize:11,color:M.textDim,opacity:0.4 }}>Drag brain region agents from the palette to build your neural workflow</div>
                <div style={{ fontSize:9,color:M.textDim,opacity:0.25,marginTop:8,letterSpacing:1 }}>
                  SUGGESTED: RAS → THL → PFC → BROCA → OUT
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Inspector / Log / Config */}
        <div style={{ width:258,background:M.ink,borderLeft:`1px solid ${M.border}`,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0 }}>
          {/* Tabs */}
          <div style={{ display:"flex",borderBottom:`1px solid ${M.border}` }}>
            {["inspector","log","config"].map(t => (
              <button key={t} onClick={()=>setTab(t)}
                style={{ flex:1,padding:"6px 0",background:tab===t?M.ink2:"transparent",border:"none",color:tab===t?M.text:M.textDim,cursor:"pointer",fontSize:8,letterSpacing:1.5,fontFamily:"monospace",textTransform:"uppercase",borderBottom:tab===t?`2px solid ${M.neural}`:"2px solid transparent",transition:"all 0.15s" }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ flex:1,overflow:"auto" }}>

            {/* ── INSPECTOR ── */}
            {tab==="inspector" && (
              <div style={{ padding:12 }}>
                {sel && selDef ? (
                  <>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                      <div style={{ width:10,height:10,borderRadius:"50%",background:selDef.color,flexShrink:0 }} />
                      <span style={{ fontSize:11,fontWeight:700,color:selDef.color,lineHeight:1.3 }}>{selDef.label}</span>
                    </div>
                    <div style={{ fontSize:8,color:M.textDim,marginBottom:8,lineHeight:1.7 }}>{selDef.bio}</div>

                    <Row label="TYPE">{selDef.nodeType}</Row>
                    <Row label="MODEL">{selDef.model||"passthrough"}</Row>
                    <Row label="TIER">{selDef.tier}</Row>

                    {/* Trit Vector */}
                    <div style={{ marginBottom:10 }}>
                      <Label>TRIT VECTOR [S · T · R]</Label>
                      <div style={{ display:"flex",gap:6 }}>
                        {["S","T","R"].map((lbl,i) => (
                          <div key={i} style={{ flex:1 }}>
                            <div style={{ fontSize:8,color:M.textDim,textAlign:"center",marginBottom:3 }}>{lbl}</div>
                            <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
                              {[1,0,-1].map(v => (
                                <button key={v} onClick={()=>dispatch({ type:"SET_TRIT", nodeId:sel.id, dim:i, val:v })}
                                  style={{ padding:"2px 0",background:sel.tritVector[i]===v?`${tritColor(v)}33`:M.ink2,border:`1px solid ${sel.tritVector[i]===v?tritColor(v):M.border}`,borderRadius:3,color:sel.tritVector[i]===v?tritColor(v):M.textDim,cursor:"pointer",fontSize:9,fontFamily:"monospace",transition:"all 0.15s" }}>
                                  {tritSym(v)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Governance */}
                    <div style={{ marginBottom:10 }}>
                      <Label>GOVERNANCE (CoRax)</Label>
                      <div style={{ display:"flex",gap:3 }}>
                        {[[-1,"RESTRICT",M.error],[0,"EVALUATE",M.synthesis],[1,"PERMIT",M.success]].map(([v,lbl,col]) => (
                          <button key={v} onClick={()=>dispatch({ type:"SET_GOV", nodeId:sel.id, val:v })}
                            style={{ flex:1,padding:"4px 2px",background:sel.governance===v?`${col}22`:M.ink2,border:`1px solid ${sel.governance===v?col:M.border}`,borderRadius:4,color:sel.governance===v?col:M.textDim,cursor:"pointer",fontSize:7,fontFamily:"monospace",fontWeight:700,letterSpacing:0.5,transition:"all 0.15s" }}>
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tools */}
                    <div style={{ marginBottom:10 }}>
                      <Label>TOOL PERMISSIONS</Label>
                      <div style={{ display:"flex",flexWrap:"wrap",gap:3 }}>
                        {selDef.tools.map(t => (
                          <span key={t} style={{ padding:"2px 6px",background:`${M.antithesis}18`,border:`1px solid ${M.antithesis}33`,borderRadius:3,fontSize:8,color:M.waterLt }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* System Prompt preview */}
                    {selDef.systemPrompt && (
                      <div style={{ marginBottom:10 }}>
                        <Label>SYSTEM PROMPT</Label>
                        <div style={{ background:M.ink2,borderRadius:4,padding:6,fontSize:7,color:M.textDim,fontFamily:"monospace",lineHeight:1.6,maxHeight:80,overflow:"auto",whiteSpace:"pre-wrap" }}>
                          {selDef.systemPrompt.slice(0,300)}…
                        </div>
                      </div>
                    )}

                    {/* Output */}
                    {sel.output && (
                      <div style={{ marginBottom:10 }}>
                        <Label>LAST OUTPUT</Label>
                        <div style={{ background:M.ink2,borderRadius:4,padding:6,fontSize:8,color:M.success,fontFamily:"monospace",lineHeight:1.6,maxHeight:120,overflow:"auto",whiteSpace:"pre-wrap" }}>
                          {sel.output}
                        </div>
                      </div>
                    )}

                    <button onClick={()=>dispatch({ type:"DELETE_NODE", id:sel.id })}
                      style={{ width:"100%",padding:5,background:`${M.error}18`,border:`1px solid ${M.error}44`,borderRadius:4,color:M.error,cursor:"pointer",fontSize:9,fontFamily:"monospace",marginTop:4 }}>
                      DELETE NODE
                    </button>
                  </>
                ) : (
                  <div style={{ padding:20,textAlign:"center",color:M.textDim,fontSize:10,lineHeight:2 }}>
                    <div style={{ fontSize:28,marginBottom:8,opacity:0.15 }}>◈</div>
                    Select a node to inspect trit vector, governance state, system prompt, and output.
                  </div>
                )}
              </div>
            )}

            {/* ── LOG ── */}
            {tab==="log" && (
              <div ref={logRef} style={{ padding:8,flex:1 }}>
                {state.log.length===0
                  ? <div style={{ color:M.textDim,padding:16,textAlign:"center",fontSize:9 }}>No activity yet. Build a workflow and press RUN.</div>
                  : state.log.map((e,i) => <LogLine key={i} entry={e} />)
                }
              </div>
            )}

            {/* ── CONFIG ── */}
            {tab==="config" && (
              <div style={{ padding:12 }}>
                <Label>OLLAMA ENDPOINT</Label>
                <input value={ollamaEndpoint} onChange={e=>setOllamaEndpoint(e.target.value)}
                  style={{ width:"100%",padding:"5px 8px",background:M.ink2,border:`1px solid ${M.border}`,borderRadius:4,color:M.text,fontSize:9,fontFamily:"monospace",boxSizing:"border-box",marginBottom:8 }} />

                <Label>DEFAULT ORCHESTRATION MODEL</Label>
                <input value={defaultModel} onChange={e=>setDefaultModel(e.target.value)}
                  style={{ width:"100%",padding:"5px 8px",background:M.ink2,border:`1px solid ${M.border}`,borderRadius:4,color:M.text,fontSize:9,fontFamily:"monospace",boxSizing:"border-box",marginBottom:8 }} />

                <button onClick={()=>pingOllama(ollamaEndpoint).then(s=>dispatch({ type:"SET_OLLAMA", status:s }))}
                  style={{ width:"100%",padding:6,background:`${M.neural}18`,border:`1px solid ${M.neural}44`,borderRadius:4,color:M.neural,cursor:"pointer",fontSize:9,fontFamily:"monospace",marginBottom:12 }}>
                  ⟳ TEST CONNECTION
                </button>

                {state.ollama.ok===false && (
                  <div style={{ padding:8,background:`${M.error}11`,border:`1px solid ${M.error}33`,borderRadius:4,fontSize:8,color:M.error,lineHeight:1.8,marginBottom:10 }}>
                    Cannot reach Ollama. Ensure:<br/>
                    1. Ollama is running: <code>ollama serve</code><br/>
                    2. OLLAMA_ORIGINS allows this origin<br/>
                    3. Port 11434 is accessible<br/>
                    4. If using Docker, check CORS env var
                  </div>
                )}

                {state.ollama.models.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <Label>AVAILABLE MODELS (click to set default)</Label>
                    {state.ollama.models.map(m => (
                      <div key={m} onClick={()=>setDefaultModel(m)}
                        style={{ padding:"3px 8px",marginBottom:2,background:defaultModel===m?`${M.neural}18`:M.ink2,border:`1px solid ${defaultModel===m?M.neural:M.border}`,borderRadius:3,fontSize:9,color:defaultModel===m?M.neural:M.text,cursor:"pointer",fontFamily:"monospace" }}>
                        {m}
                      </div>
                    ))}
                  </div>
                )}

                <Label>CONNECTION TYPES</Label>
                {Object.entries(CONN_TYPES).map(([k,v]) => (
                  <div key={k} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}>
                    <div style={{ width:20,height:2,background:v.color,borderRadius:1 }} />
                    <span style={{ fontSize:8,color:v.color,fontFamily:"monospace" }}>{v.label}</span>
                  </div>
                ))}

                <div style={{ marginTop:12,padding:8,background:`${M.synthesis}0D`,border:`1px solid ${M.synthesis}33`,borderRadius:4 }}>
                  <div style={{ fontSize:8,color:M.synthesis,fontWeight:700,marginBottom:4,letterSpacing:1 }}>SECURITY</div>
                  <div style={{ fontSize:8,color:M.textDim,lineHeight:1.8 }}>
                    Ollama: bind to 127.0.0.1 only<br/>
                    OpenClaw: access via Tailscale VPN<br/>
                    Never expose :11434 or :18789 publicly<br/>
                    CoRax kill switch: always operational
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div style={{ height:22,background:M.ink,borderTop:`1px solid ${M.border}`,display:"flex",alignItems:"center",padding:"0 12px",gap:14,flexShrink:0 }}>
        <span style={{ fontSize:8,color:state.running?M.myelin:M.textDim,fontFamily:"monospace" }}>
          {state.running ? "◉ EXECUTING" : "● IDLE"}
        </span>
        <span style={{ fontSize:8,color:M.textDim,fontFamily:"monospace" }}>
          {Object.values(state.nodes).filter(n=>n.status==="done").length}/{Object.keys(state.nodes).length} nodes complete
        </span>
        <div style={{ flex:1 }} />
        <span style={{ fontSize:8,color:M.thesis,fontFamily:"monospace" }}>▲ +1 THESIS</span>
        <span style={{ fontSize:8,color:M.synthesis,fontFamily:"monospace" }}>◆ 0 SYNTHESIS</span>
        <span style={{ fontSize:8,color:M.antithesis,fontFamily:"monospace" }}>▼ -1 ANTITHESIS</span>
        <div style={{ width:1,height:14,background:M.border }} />
        <span style={{ fontSize:8,color:M.textDim,fontFamily:"monospace" }}>MIZU DIALECTICAL ENGINE</span>
      </div>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────
function Label({ children }) {
  return <div style={{ fontSize:8,color:M.textDim,letterSpacing:1.5,marginBottom:5,fontWeight:700 }}>{children}</div>;
}

function Row({ label, children }) {
  return (
    <div style={{ display:"flex",gap:8,marginBottom:5,alignItems:"baseline" }}>
      <span style={{ fontSize:8,color:M.textDim,fontFamily:"monospace",letterSpacing:1,flexShrink:0,width:52 }}>{label}</span>
      <span style={{ fontSize:9,color:M.text,fontFamily:"monospace" }}>{children}</span>
    </div>
  );
}
