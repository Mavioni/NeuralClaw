import { M } from "../../theme/mizu.js";
import { tritColor, tritSym } from "../../utils/helpers.js";
import { AGENTS } from "../../constants/agents.js";
import Label from "../shared/Label.jsx";
import Row from "../shared/Row.jsx";

export default function InspectorTab({ sel, dispatch }) {
  if (!sel) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: M.textDim, fontSize: 10, lineHeight: 2 }}>
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.15 }}>◈</div>
        Select a node to inspect trit vector, governance state, system prompt, and output.
      </div>
    );
  }

  const selDef = AGENTS[sel.agentType];
  if (!selDef) return null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: selDef.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: selDef.color, lineHeight: 1.3 }}>{selDef.label}</span>
      </div>
      <div style={{ fontSize: 8, color: M.textDim, marginBottom: 8, lineHeight: 1.7 }}>{selDef.bio}</div>

      <Row label="TYPE">{selDef.nodeType}</Row>
      <Row label="BACKEND">{selDef.backend || "passthrough"}</Row>
      <Row label="MODEL">{selDef.model || "none"}</Row>
      <Row label="TIER">{selDef.tier}</Row>

      {/* Trit Vector */}
      <div style={{ marginBottom: 10 }}>
        <Label>TRIT VECTOR [S · T · R]</Label>
        <div style={{ display: "flex", gap: 6 }}>
          {["S", "T", "R"].map((lbl, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontSize: 8, color: M.textDim, textAlign: "center", marginBottom: 3 }}>{lbl}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[1, 0, -1].map((v) => (
                  <button
                    key={v}
                    onClick={() => dispatch({ type: "SET_TRIT", nodeId: sel.id, dim: i, val: v })}
                    style={{
                      padding: "2px 0",
                      background: sel.tritVector[i] === v ? `${tritColor(v)}33` : M.ink2,
                      border: `1px solid ${sel.tritVector[i] === v ? tritColor(v) : M.border}`,
                      borderRadius: 3,
                      color: sel.tritVector[i] === v ? tritColor(v) : M.textDim,
                      cursor: "pointer",
                      fontSize: 9,
                      fontFamily: "monospace",
                      transition: "all 0.15s",
                    }}
                  >
                    {tritSym(v)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance */}
      <div style={{ marginBottom: 10 }}>
        <Label>GOVERNANCE (CoRax)</Label>
        <div style={{ display: "flex", gap: 3 }}>
          {[
            [-1, "RESTRICT", M.error],
            [0, "EVALUATE", M.synthesis],
            [1, "PERMIT", M.success],
          ].map(([v, lbl, col]) => (
            <button
              key={v}
              onClick={() => dispatch({ type: "SET_GOV", nodeId: sel.id, val: v })}
              style={{
                flex: 1,
                padding: "4px 2px",
                background: sel.governance === v ? `${col}22` : M.ink2,
                border: `1px solid ${sel.governance === v ? col : M.border}`,
                borderRadius: 4,
                color: sel.governance === v ? col : M.textDim,
                cursor: "pointer",
                fontSize: 7,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 0.5,
                transition: "all 0.15s",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div style={{ marginBottom: 10 }}>
        <Label>TOOL PERMISSIONS</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {selDef.tools.map((t) => (
            <span
              key={t}
              style={{
                padding: "2px 6px",
                background: `${M.antithesis}18`,
                border: `1px solid ${M.antithesis}33`,
                borderRadius: 3,
                fontSize: 8,
                color: M.waterLt,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* System Prompt preview */}
      {selDef.systemPrompt && (
        <div style={{ marginBottom: 10 }}>
          <Label>SYSTEM PROMPT</Label>
          <div
            style={{
              background: M.ink2,
              borderRadius: 4,
              padding: 6,
              fontSize: 7,
              color: M.textDim,
              fontFamily: "monospace",
              lineHeight: 1.6,
              maxHeight: 80,
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {selDef.systemPrompt.slice(0, 300)}…
          </div>
        </div>
      )}

      {/* Output */}
      {sel.output && (
        <div style={{ marginBottom: 10 }}>
          <Label>LAST OUTPUT</Label>
          <div
            style={{
              background: M.ink2,
              borderRadius: 4,
              padding: 6,
              fontSize: 8,
              color: M.success,
              fontFamily: "monospace",
              lineHeight: 1.6,
              maxHeight: 120,
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {sel.output}
          </div>
        </div>
      )}

      <button
        onClick={() => dispatch({ type: "DELETE_NODE", id: sel.id })}
        style={{
          width: "100%",
          padding: 5,
          background: `${M.error}18`,
          border: `1px solid ${M.error}44`,
          borderRadius: 4,
          color: M.error,
          cursor: "pointer",
          fontSize: 9,
          fontFamily: "monospace",
          marginTop: 4,
        }}
      >
        DELETE NODE
      </button>
    </>
  );
}
