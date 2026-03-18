import { M } from "../theme/mizu.js";
import { AGENTS } from "../constants/agents.js";
import { TIERS } from "../constants/tiers.js";

export default function NodePalette({ onDragStart }) {
  return (
    <div
      style={{
        width: 196,
        background: M.ink,
        borderRight: `1px solid ${M.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "7px 10px",
          fontSize: 8,
          color: M.textDim,
          letterSpacing: 2,
          borderBottom: `1px solid ${M.border}`,
          fontWeight: 700,
        }}
      >
        BRAIN REGION AGENTS
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
        {TIERS.map((tier) => (
          <div key={tier.id} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 8,
                color: tier.color,
                letterSpacing: 1.5,
                marginBottom: 5,
                fontWeight: 700,
              }}
            >
              {tier.label.toUpperCase()}
            </div>
            {tier.agents.map((aid) => {
              const def = AGENTS[aid];
              return (
                <div
                  key={aid}
                  draggable
                  onDragStart={(e) => onDragStart(e, aid)}
                  style={{
                    padding: "5px 8px",
                    background: `${def.color}14`,
                    border: `1px solid ${def.color}33`,
                    borderRadius: 5,
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 3,
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = def.color)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = `${def.color}33`)
                  }
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: def.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      color: M.text,
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {def.short}
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      color: M.textDim,
                      flex: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {def.label}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          padding: 8,
          borderTop: `1px solid ${M.border}`,
          fontSize: 8,
          color: M.textDim,
          lineHeight: 1.8,
        }}
      >
        Drag → canvas
        <br />
        Red port: output
        <br />
        Blue port: input
        <br />
        Click connection to delete
      </div>
    </div>
  );
}
