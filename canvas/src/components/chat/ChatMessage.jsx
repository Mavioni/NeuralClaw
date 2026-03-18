import { M } from "../../theme/mizu.js";
import { AGENTS } from "../../constants/agents.js";
import ToolCall from "./ToolCall.jsx";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div style={{
        display: "flex", justifyContent: "center",
        padding: "6px 16px", margin: "4px 0",
      }}>
        <span style={{
          fontSize: 9, color: M.textDim, fontFamily: "monospace",
          background: M.ink2, padding: "3px 10px", borderRadius: 10,
          letterSpacing: 0.5,
        }}>
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      padding: "4px 16px",
      margin: "2px 0",
    }}>
      {/* Agent attribution */}
      {!isUser && message.agents?.length > 0 && (
        <div style={{
          display: "flex", gap: 4, marginBottom: 3, alignItems: "center",
        }}>
          {message.agents.map((a) => {
            const def = AGENTS[a];
            return def ? (
              <span key={a} style={{
                fontSize: 7, color: def.color, fontFamily: "monospace",
                background: `${def.color}15`, padding: "1px 5px",
                borderRadius: 3, letterSpacing: 0.5,
              }}>
                {a}
              </span>
            ) : null;
          })}
          {message.duration && (
            <span style={{ fontSize: 7, color: M.textDim, fontFamily: "monospace" }}>
              {(message.duration / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div style={{
        maxWidth: "80%",
        padding: "10px 14px",
        borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        background: isUser ? M.antithesis + "40" : M.surface,
        border: `1px solid ${isUser ? M.antithesis + "30" : M.border}`,
        position: "relative",
      }}>
        {/* Content */}
        <div style={{
          fontSize: 12, color: M.text, lineHeight: 1.5,
          fontFamily: "'Courier New', monospace",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {message.content}
          {message.streaming && (
            <span style={{
              display: "inline-block", width: 6, height: 14,
              background: M.neural, marginLeft: 2,
              animation: "blink 1s infinite",
              verticalAlign: "text-bottom",
            }} />
          )}
        </div>

        {/* Tool calls */}
        {message.toolCalls?.map((tc, i) => (
          <ToolCall key={i} call={tc} />
        ))}

        {/* TRT reasoning indicator */}
        {message.trtRounds > 0 && (
          <div style={{
            marginTop: 6, paddingTop: 6,
            borderTop: `1px solid ${M.border}`,
            display: "flex", gap: 6, alignItems: "center",
          }}>
            <span style={{
              fontSize: 7, color: M.thesis, fontFamily: "monospace",
            }}>
              TRT {message.trtRounds}R
            </span>
            <span style={{
              fontSize: 7, color: M.neural, fontFamily: "monospace",
            }}>
              {Math.round((message.confidence || 0) * 100)}% conf
            </span>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <span style={{
        fontSize: 7, color: M.textDim + "80", fontFamily: "monospace",
        marginTop: 2, padding: "0 4px",
      }}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
