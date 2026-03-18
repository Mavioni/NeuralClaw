import { AGENTS } from "../constants/agents.js";
import { callOllama } from "../api/ollama.js";

// ── Workflow Execution Engine ────────────────────────────────────────
// BFS traversal through the neural graph. Each node is an agent that
// processes input via Ollama (or passes through for non-LLM nodes).

export async function runWorkflow({
  nodes,
  connections,
  workflowInput,
  ollamaEndpoint,
  defaultModel,
  dispatch,
  log,
}) {
  dispatch({ type: "SET_RUNNING", val: true });
  log(null, "━━ WORKFLOW START ━━", "info");

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
      log(def.short, `← "${String(input).slice(0, 60)}"`, "info");

      let output = input;

      if (def.model) {
        try {
          const model = def.model === "llama3.2" ? defaultModel : def.model;
          output = await callOllama(
            ollamaEndpoint,
            model,
            def.systemPrompt,
            String(input),
            (_, full) => dispatch({ type: "SET_NODE", id: toId, patch: { output: full } })
          );
          dispatch({ type: "SET_NODE", id: toId, patch: { status: "done", output } });
          log(def.short, `→ "${String(output).slice(0, 80)}"`, "success");
        } catch (err) {
          output = `[ERROR] ${err.message}`;
          dispatch({ type: "SET_NODE", id: toId, patch: { status: "error", output } });
          log(def.short, err.message, "error");
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
