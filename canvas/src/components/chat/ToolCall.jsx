import { M } from "../../theme/mizu.js";

export default function ToolCall({ call }) {
  return (
    <div style={{
      marginTop: 8, padding: "6px 10px",
      background: M.ink2, borderRadius: 6,
      border: `1px solid ${M.border}`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
      }}>
        <span style={{
          fontSize: 8, color: M.myelin, fontFamily: "monospace",
          letterSpacing: 1,
        }}>
          TOOL
        </span>
        <span style={{
          fontSize: 9, color: M.text, fontFamily: "monospace",
          fontWeight: 700,
        }}>
          {call.name}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 7, fontFamily: "monospace",
          color: call.status === "done" ? M.success :
                 call.status === "error" ? M.error : M.myelin,
        }}>
          {call.status === "done" ? "done" :
           call.status === "error" ? "failed" : "running..."}
        </span>
      </div>
      {call.args && (
        <div style={{
          fontSize: 9, color: M.textDim, fontFamily: "monospace",
          whiteSpace: "pre-wrap", maxHeight: 60, overflow: "hidden",
        }}>
          {typeof call.args === "string" ? call.args : JSON.stringify(call.args, null, 2)}
        </div>
      )}
      {call.result && (
        <div style={{
          fontSize: 9, color: M.neural, fontFamily: "monospace",
          marginTop: 4, whiteSpace: "pre-wrap",
          maxHeight: 80, overflow: "hidden",
        }}>
          {call.result}
        </div>
      )}
    </div>
  );
}
