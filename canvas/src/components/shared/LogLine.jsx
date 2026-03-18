import { M } from "../../theme/mizu.js";

export default function LogLine({ entry }) {
  const color =
    entry.kind === "error"
      ? M.error
      : entry.kind === "success"
        ? M.success
        : entry.kind === "warn"
          ? M.warn
          : M.waterLt;
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "flex-start",
        padding: "2px 0",
        borderBottom: `1px solid ${M.border}22`,
      }}
    >
      <span
        style={{
          color: M.textDim,
          fontSize: 8,
          flexShrink: 0,
          fontFamily: "monospace",
        }}
      >
        {new Date(entry.t).toLocaleTimeString()}
      </span>
      <span
        style={{
          color,
          fontSize: 8,
          fontWeight: 700,
          flexShrink: 0,
          fontFamily: "monospace",
        }}
      >
        [{entry.node}]
      </span>
      <span
        style={{
          color: M.text,
          fontSize: 8,
          flex: 1,
          wordBreak: "break-all",
          fontFamily: "monospace",
          lineHeight: 1.5,
        }}
      >
        {entry.msg}
      </span>
    </div>
  );
}
