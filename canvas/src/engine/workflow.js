import { AGENTS } from "../constants/agents.js";
import { callOllama } from "../api/ollama.js";
import { callTritTRT } from "../api/trit-trt.js";

// ── Workflow Execution Engine ────────────────────────────────────────
// BFS traversal through the neural graph. Each node is an agent that
// processes input via TRIT-TRT (primary) or Ollama (fallback).
//
// TRIT-TRT agents use the dialectical reasoning loop:
//   Generate (thesis) → Select (antithesis) → Reflect (synthesis)
// This maps directly to the MIZU ternary architecture.

async function invokeAgent(def, input, config, dispatch, toId) {
  const backend = def.backend || "ollama";

  if (backend === "trit-trt") {
    // ── TRIT-TRT: Ternary Dialectical Inference ────────────────
    const wsEndpoint = config.tritTrtEndpoint.replace(/^http/, "ws") + "/ws";
    const trtSettings = {
      rounds: config.trtRounds || 3,
      candidates: config.trtCandidates || 8,
      max_tokens: 512,
      temperature: 0.6,
      selection_method: "self_consistency",
      reflection_depth: "standard",
      early_stop_threshold: 0.95,
      knowledge_persistence: true,
    };

    // Prepend system prompt to the user input
    const prompt = def.systemPrompt
      ? `${def.systemPrompt}\n\n${String(input)}`
      : String(input);

    const result = await callTritTRT(
      wsEndpoint,
      prompt,
      trtSettings,
      (phase) => {
        // Stream TRT phase updates to the node output
        if (phase.type === "selected") {
          dispatch({ type: "SET_NODE", id: toId, patch: { output: phase.text } });
        } else if (phase.type === "status") {
          const label = `[TRT R${phase.round}/${phase.total_rounds}] ${phase.phase}...`;
          dispatch({ type: "SET_NODE", id: toId, patch: { output: label } });
        }
      }
    );

    return result.text;
  } else {
    // ── Ollama: Standard local inference (fallback) ────────────
    const model = def.model || config.defaultModel;
    return await callOllama(
      config.ollamaEndpoint,
      model,
      def.systemPrompt,
      String(input),
      (_, full) => dispatch({ type: "SET_NODE", id: toId, patch: { output: full } })
    );
  }
}

export async function runWorkflow({
  nodes,
  connections,
  workflowInput,
  ollamaEndpoint,
  defaultModel,
  tritTrtEndpoint,
  trtRounds,
  trtCandidates,
  dispatch,
  log,
}) {
  dispatch({ type: "SET_RUNNING", val: true });
  log(null, "━━ WORKFLOW START ━━", "info");

  const config = {
    ollamaEndpoint,
    defaultModel,
    tritTrtEndpoint: tritTrtEndpoint || "http://localhost:8765",
    trtRounds: trtRounds || 3,
    trtCandidates: trtCandidates || 8,
  };

  // Reset all nodes
  Object.keys(nodes).forEach((id) =>
    dispatch({ type: "SET_NODE", id, patch: { status: "idle", output: null } })
  );

  // Find triggers
  const triggers = Object.values(nodes).filter(
    (n) => AGENTS[n.agentType]?.nodeType === "TRIGGER"
  );
  if (!triggers.length) {
    log(null, "No trigger node found. Add a Reticular Formation (RAS) node.", "warn");
    dispatch({ type: "SET_RUNNING", val: false });
    return;
  }

  const outputs = {}; // nodeId → last output string
  const visited = new Set();

  // Seed triggers
  triggers.forEach((n) => {
    const input = workflowInput || "ACTIVATE";
    outputs[n.id] = input;
    visited.add(n.id);
    dispatch({ type: "SET_NODE", id: n.id, patch: { status: "done", output: input } });
    log(AGENTS[n.agentType].short, `Fired: "${input}"`, "success");
  });

  // BFS through graph
  const queue = triggers.map((n) => n.id);

  while (queue.length > 0) {
    const fromId = queue.shift();
    const downstream = connections.filter((c) => c.from === fromId);

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
        dispatch({ type: "SET_NODE", id: toId, patch: { status: "restricted" } });
        continue;
      }

      const input = outputs[fromId] || "";
      dispatch({ type: "SET_NODE", id: toId, patch: { status: "running" } });
      const backendLabel = def.backend === "trit-trt" ? "TRT" : "OLL";
      log(def.short, `[${backendLabel}] ← "${String(input).slice(0, 60)}"`, "info");

      let output = input;

      if (def.model) {
        try {
          output = await invokeAgent(def, input, config, dispatch, toId);
          dispatch({ type: "SET_NODE", id: toId, patch: { status: "done", output } });
          log(def.short, `→ "${String(output).slice(0, 80)}"`, "success");
        } catch (err) {
          // Fallback: if trit-trt fails, try Ollama
          if (def.backend === "trit-trt") {
            log(def.short, `TRT failed (${err.message}), falling back to Ollama...`, "warn");
            try {
              output = await callOllama(
                config.ollamaEndpoint,
                config.defaultModel,
                def.systemPrompt,
                String(input),
                (_, full) => dispatch({ type: "SET_NODE", id: toId, patch: { output: full } })
              );
              dispatch({ type: "SET_NODE", id: toId, patch: { status: "done", output } });
              log(def.short, `[FALLBACK] → "${String(output).slice(0, 80)}"`, "success");
            } catch (fallbackErr) {
              output = `[ERROR] ${fallbackErr.message}`;
              dispatch({ type: "SET_NODE", id: toId, patch: { status: "error", output } });
              log(def.short, fallbackErr.message, "error");
            }
          } else {
            output = `[ERROR] ${err.message}`;
            dispatch({ type: "SET_NODE", id: toId, patch: { status: "error", output } });
            log(def.short, err.message, "error");
          }
        }
      } else {
        // No-LLM passthrough (triggers, output nodes)
        dispatch({ type: "SET_NODE", id: toId, patch: { status: "done", output } });
        if (def.nodeType === "OUTPUT") {
          log(def.short, `✓ Final output: "${String(output).slice(0, 100)}"`, "success");
        }
      }

      outputs[toId] = output;
      queue.push(toId);
    }
  }

  dispatch({ type: "SET_RUNNING", val: false });
  log(null, "━━ WORKFLOW COMPLETE ━━", "success");
}
