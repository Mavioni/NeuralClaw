import { M } from "../theme/mizu.js";

export default function TopBar({
  ollama,
  nodeCount,
  connectionCount,
  workflowInput,
  setWorkflowInput,
  running,
  onRun,
  onReset,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        height: 46,
        background: M.ink,
        borderBottom: `1px solid ${M.border}`,
        gap: 10,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginRight: 6 }}>
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: M.neural,
            boxShadow: `0 0 10px ${M.neural}`,
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 700, color: M.neural, letterSpacing: 3 }}>
          NEURAL-CLAW
        </span>
        <span style={{ fontSize: 8, color: M.textDim, letterSpacing: 1 }}>
          v0.1.0 · MIZU ENGINE
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: M.border }} />

      {/* Ollama status */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background:
              ollama.ok === true
                ? M.success
                : ollama.ok === false
                  ? M.error
                  : M.synthesis,
          }}
        />
        <span style={{ fontSize: 9, color: M.textDim }}>
          {ollama.ok === true
            ? `Ollama · ${ollama.models.length} models`
            : ollama.ok === false
              ? "Ollama offline"
              : "Checking…"}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Stats */}
      <span style={{ fontSize: 9, color: M.textDim }}>
        {nodeCount} nodes · {connectionCount} synapses
      </span>

      <div style={{ width: 1, height: 20, background: M.border }} />

      {/* Input */}
      <input
        value={workflowInput}
        onChange={(e) => setWorkflowInput(e.target.value)}
        placeholder="Workflow trigger input…"
        style={{
          padding: "4px 10px",
          background: M.ink2,
          border: `1px solid ${M.border}`,
          borderRadius: 4,
          color: M.text,
          fontSize: 10,
          width: 220,
          fontFamily: "monospace",
        }}
        onKeyDown={(e) => e.key === "Enter" && onRun()}
      />

      <button
        onClick={onRun}
        disabled={running}
        style={{
          padding: "5px 16px",
          background: running ? M.dim : M.neural,
          color: M.deep,
          border: "none",
          borderRadius: 4,
          cursor: running ? "default" : "pointer",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "monospace",
          letterSpacing: 1,
          flexShrink: 0,
        }}
      >
        {running ? "◉ RUNNING" : "▶ RUN"}
      </button>

      <button
        onClick={onReset}
        style={{
          padding: "5px 10px",
          background: "transparent",
          color: M.textDim,
          border: `1px solid ${M.border}`,
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 10,
          fontFamily: "monospace",
        }}
      >
        RESET
      </button>
    </div>
  );
}
