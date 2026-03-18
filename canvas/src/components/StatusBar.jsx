import { M } from "../theme/mizu.js";

export default function StatusBar({ running, doneCount, totalCount }) {
  return (
    <div
      style={{
        height: 22,
        background: M.ink,
        borderTop: `1px solid ${M.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        gap: 14,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 8,
          color: running ? M.myelin : M.textDim,
          fontFamily: "monospace",
        }}
      >
        {running ? "◉ EXECUTING" : "● IDLE"}
      </span>
      <span style={{ fontSize: 8, color: M.textDim, fontFamily: "monospace" }}>
        {doneCount}/{totalCount} nodes complete
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 8, color: M.thesis, fontFamily: "monospace" }}>
        ▲ +1 THESIS
      </span>
      <span style={{ fontSize: 8, color: M.synthesis, fontFamily: "monospace" }}>
        ◆ 0 SYNTHESIS
      </span>
      <span style={{ fontSize: 8, color: M.antithesis, fontFamily: "monospace" }}>
        ▼ -1 ANTITHESIS
      </span>
      <div style={{ width: 1, height: 14, background: M.border }} />
      <span style={{ fontSize: 8, color: M.textDim, fontFamily: "monospace" }}>
        MIZU DIALECTICAL ENGINE
      </span>
    </div>
  );
}
