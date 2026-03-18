import { M } from "../../theme/mizu.js";
import { tritLabel } from "../../utils/helpers.js";
import { AGENTS } from "../../constants/agents.js";
import StatusDot from "../shared/StatusDot.jsx";
import TritVec from "../shared/TritVec.jsx";

export default function CNode({ node, selected, onDown, onPortClick }) {
  const def = AGENTS[node.agentType];
  if (!def) return null;
  const gColor =
    node.governance === 1
      ? M.success
      : node.governance === -1
        ? M.error
        : M.synthesis;

  return (
    <div
      onMouseDown={onDown}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: 188,
        background: M.surface,
        border: `1.5px solid ${selected ? def.color : M.border}`,
        borderRadius: 8,
        cursor: "grab",
        userSelect: "none",
        zIndex: selected ? 20 : 1,
        boxShadow: selected
          ? `0 0 0 2px ${def.color}55, 0 6px 24px ${def.color}22`
          : node.status === "running"
            ? `0 0 16px ${M.myelin}33`
            : "0 2px 12px #00000066",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `${def.color}1A`,
          borderBottom: `1px solid ${M.border}`,
          padding: "5px 8px",
          borderRadius: "6px 6px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <StatusDot status={node.status || "idle"} />
        <span
          style={{
            fontSize: 10,
            color: def.color,
            fontFamily: "monospace",
            fontWeight: 700,
            flex: 1,
            letterSpacing: 1,
          }}
        >
          {def.short}
        </span>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: gColor,
            boxShadow: `0 0 4px ${gColor}`,
          }}
          title={`Governance: ${tritLabel(node.governance)}`}
        />
      </div>

      {/* Body */}
      <div style={{ padding: "6px 8px" }}>
        <div
          style={{
            fontSize: 10,
            color: M.text,
            fontWeight: 600,
            marginBottom: 2,
            lineHeight: 1.3,
          }}
        >
          {def.label}
        </div>
        <div
          style={{
            fontSize: 8,
            color: M.textDim,
            marginBottom: 5,
            fontFamily: "monospace",
          }}
        >
          {def.nodeType}
        </div>
        <TritVec vec={node.tritVector} />
        {node.output && (
          <div
            style={{
              marginTop: 5,
              padding: "3px 5px",
              background: `${M.neural}0D`,
              borderRadius: 3,
              fontSize: 7,
              color: M.neural,
              fontFamily: "monospace",
              maxHeight: 32,
              overflow: "hidden",
              lineHeight: 1.5,
            }}
          >
            {String(node.output).replace(/\n/g, " ").slice(0, 90)}
            {String(node.output).length > 90 ? "…" : ""}
          </div>
        )}
      </div>

      {/* Input port */}
      {def.ports.in > 0 && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onPortClick(node.id, "in");
          }}
          style={{
            position: "absolute",
            left: -7,
            top: "50%",
            transform: "translateY(-50%)",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: M.ink2,
            border: `2px solid ${M.antithesis}`,
            cursor: "crosshair",
            zIndex: 5,
          }}
        />
      )}
      {/* Output port */}
      {def.ports.out > 0 && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onPortClick(node.id, "out");
          }}
          style={{
            position: "absolute",
            right: -7,
            top: "50%",
            transform: "translateY(-50%)",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: M.ink2,
            border: `2px solid ${M.thesis}`,
            cursor: "crosshair",
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
}
