import { M } from "../../theme/mizu.js";

export default function Row({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "baseline" }}>
      <span
        style={{
          fontSize: 8,
          color: M.textDim,
          fontFamily: "monospace",
          letterSpacing: 1,
          flexShrink: 0,
          width: 52,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 9, color: M.text, fontFamily: "monospace" }}>
        {children}
      </span>
    </div>
  );
}
