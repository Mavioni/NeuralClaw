import { M } from "../../theme/mizu.js";
import { AGENTS } from "../../constants/agents.js";

export default function MemoryPanel({ knowledge, metrics, sessions, currentSessionId, onSelectSession, onNewSession, onDeleteSession }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {/* Sessions */}
      <Section title="Sessions">
        <button
          onClick={onNewSession}
          style={{
            width: "100%", padding: "6px 8px", marginBottom: 6,
            background: M.neural + "20", border: `1px dashed ${M.neural}40`,
            borderRadius: 6, color: M.neural, cursor: "pointer",
            fontSize: 9, fontFamily: "monospace",
            transition: "all 0.15s",
          }}
        >
          + New Session
        </button>

        <div style={{ maxHeight: 140, overflow: "auto" }}>
          {(sessions || []).slice(0, 20).map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectSession?.(s.id)}
              style={{
                padding: "5px 8px", marginBottom: 2,
                background: s.id === currentSessionId ? M.ink3 : "transparent",
                borderRadius: 4, cursor: "pointer",
                borderLeft: s.id === currentSessionId
                  ? `2px solid ${M.neural}` : "2px solid transparent",
                transition: "all 0.1s",
              }}
            >
              <div style={{
                fontSize: 9, color: M.text, fontFamily: "monospace",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {s.title || "Untitled"}
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 7, color: M.textDim, fontFamily: "monospace" }}>
                  {s.messageCount || 0} msgs
                </span>
                <span style={{ fontSize: 7, color: M.textDim, fontFamily: "monospace" }}>
                  {formatRelativeTime(s.lastActive)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Knowledge growth */}
      <Section title="Knowledge Growth">
        {metrics && (
          <div style={{ marginBottom: 8 }}>
            <GrowthBar
              label="Knowledge"
              value={metrics.totalKnowledge}
              max={500}
              color={M.thesis}
            />
            <GrowthBar
              label="Sessions"
              value={metrics.totalSessions}
              max={100}
              color={M.neural}
            />
            <GrowthBar
              label="Messages"
              value={metrics.totalMessages}
              max={1000}
              color={M.antithesis}
            />
          </div>
        )}
      </Section>

      {/* Agent activation heatmap */}
      {metrics?.agentActivations && Object.keys(metrics.agentActivations).length > 0 && (
        <Section title="Agent Activations">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {Object.entries(metrics.agentActivations)
              .sort(([, a], [, b]) => b - a)
              .map(([agentId, count]) => {
                const def = AGENTS[agentId];
                if (!def) return null;
                const maxCount = Math.max(...Object.values(metrics.agentActivations));
                const intensity = count / maxCount;
                return (
                  <div key={agentId} style={{
                    padding: "2px 6px", borderRadius: 3,
                    background: `${def.color}${Math.round(intensity * 40 + 10).toString(16)}`,
                    border: `1px solid ${def.color}30`,
                  }}>
                    <span style={{
                      fontSize: 7, color: def.color, fontFamily: "monospace",
                      opacity: 0.5 + intensity * 0.5,
                    }}>
                      {def.short} {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </Section>
      )}

      {/* Recent knowledge entries */}
      <Section title="Recent Memories">
        {(knowledge || []).length === 0 ? (
          <div style={{
            fontSize: 9, color: M.textDim, fontFamily: "monospace",
            textAlign: "center", padding: 12, opacity: 0.5,
          }}>
            No memories yet. Start chatting to grow your brain.
          </div>
        ) : (
          <div style={{ maxHeight: 200, overflow: "auto" }}>
            {(knowledge || []).slice(0, 20).map((k) => (
              <div key={k.id} style={{
                padding: "4px 6px", marginBottom: 3,
                background: M.ink2, borderRadius: 4,
                borderLeft: `2px solid ${M.synthesis}40`,
              }}>
                <div style={{
                  fontSize: 8, color: M.text, fontFamily: "monospace",
                  lineHeight: 1.3, whiteSpace: "pre-wrap",
                  maxHeight: 36, overflow: "hidden",
                }}>
                  {k.text}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginTop: 2,
                }}>
                  <span style={{ fontSize: 6, color: M.textDim, fontFamily: "monospace" }}>
                    {Math.round(k.confidence * 100)}% conf
                  </span>
                  <span style={{ fontSize: 6, color: M.textDim, fontFamily: "monospace" }}>
                    {formatRelativeTime(k.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: M.surface, borderRadius: 6,
      border: `1px solid ${M.border}`, overflow: "hidden",
    }}>
      <div style={{
        padding: "5px 10px",
        borderBottom: `1px solid ${M.border}`,
      }}>
        <span style={{
          fontSize: 7, color: M.textDim, fontFamily: "monospace",
          letterSpacing: 1.5, textTransform: "uppercase",
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: 8 }}>
        {children}
      </div>
    </div>
  );
}

function GrowthBar({ label, value, max, color }) {
  const pct = Math.min(value / max, 1) * 100;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", marginBottom: 2,
      }}>
        <span style={{ fontSize: 7, color: M.textDim, fontFamily: "monospace" }}>
          {label}
        </span>
        <span style={{ fontSize: 7, color, fontFamily: "monospace" }}>
          {value}
        </span>
      </div>
      <div style={{
        height: 3, background: M.ink2, borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: color, borderRadius: 2,
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
