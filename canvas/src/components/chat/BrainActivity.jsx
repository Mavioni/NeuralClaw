import { M } from "../../theme/mizu.js";
import { AGENTS } from "../../constants/agents.js";
import { TIERS } from "../../constants/tiers.js";

// Brain region positions for the mini-map (relative %)
const POSITIONS = {
  RAS:      { x: 50, y: 88 },
  LC:       { x: 70, y: 85 },
  THL:      { x: 50, y: 68 },
  PFC:      { x: 30, y: 30 },
  MOTOR:    { x: 50, y: 20 },
  SENSORY:  { x: 70, y: 25 },
  BROCA:    { x: 20, y: 45 },
  WERNICKE: { x: 80, y: 45 },
  HIPPO:    { x: 30, y: 55 },
  AMYGDALA: { x: 70, y: 55 },
  ACC:      { x: 50, y: 48 },
  STRIATUM: { x: 40, y: 62 },
  VTA:      { x: 60, y: 62 },
  CBL:      { x: 80, y: 78 },
  OUT:      { x: 50, y: 10 },
};

// Synaptic connections to draw
const PATHWAYS = [
  ["RAS", "THL"], ["LC", "THL"],
  ["THL", "PFC"], ["THL", "SENSORY"], ["THL", "HIPPO"], ["THL", "AMYGDALA"],
  ["SENSORY", "WERNICKE"], ["WERNICKE", "PFC"],
  ["PFC", "MOTOR"], ["PFC", "BROCA"], ["PFC", "STRIATUM"],
  ["MOTOR", "OUT"], ["BROCA", "OUT"],
  ["HIPPO", "ACC"], ["AMYGDALA", "ACC"],
  ["STRIATUM", "VTA"], ["STRIATUM", "MOTOR"],
  ["CBL", "MOTOR"],
];

export default function BrainActivity({ activity, phase, metrics }) {
  // activity: { [agentId]: "idle" | "active" | "done" }
  const activityMap = activity || {};

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: M.surface, borderRadius: 8,
      border: `1px solid ${M.border}`,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "6px 10px",
        borderBottom: `1px solid ${M.border}`,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: "50%",
          background: phase ? M.neural : M.dim,
          boxShadow: phase ? `0 0 6px ${M.neural}` : "none",
        }} />
        <span style={{
          fontSize: 8, color: M.textDim, fontFamily: "monospace",
          letterSpacing: 1.5, textTransform: "uppercase",
        }}>
          Brain Activity
        </span>
        {phase && (
          <span style={{
            fontSize: 8, color: M.neural, fontFamily: "monospace",
            marginLeft: "auto",
          }}>
            {phase.label}
          </span>
        )}
      </div>

      {/* Brain map */}
      <div style={{ position: "relative", height: 180, margin: "4px 0" }}>
        {/* Brain outline */}
        <svg style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
        }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Brain silhouette */}
          <ellipse cx="50" cy="50" rx="42" ry="44"
            fill="none" stroke={M.border} strokeWidth="0.5" opacity="0.3" />
          <ellipse cx="50" cy="45" rx="36" ry="38"
            fill="none" stroke={M.border} strokeWidth="0.3" opacity="0.15" />

          {/* Pathways */}
          {PATHWAYS.map(([from, to], i) => {
            const p1 = POSITIONS[from];
            const p2 = POSITIONS[to];
            if (!p1 || !p2) return null;
            const fromActive = activityMap[from] === "active" || activityMap[from] === "done";
            const toActive = activityMap[to] === "active" || activityMap[to] === "done";
            const lit = fromActive && toActive;
            return (
              <line key={i}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={lit ? M.neural : M.border}
                strokeWidth={lit ? 0.8 : 0.3}
                opacity={lit ? 0.6 : 0.15}
              />
            );
          })}

          {/* Nodes */}
          {Object.entries(POSITIONS).map(([id, pos]) => {
            const def = AGENTS[id];
            if (!def) return null;
            const status = activityMap[id] || "idle";
            const isActive = status === "active";
            const isDone = status === "done";
            const color = isDone ? M.success : isActive ? M.neural : def.color;
            const radius = isActive ? 3.5 : isDone ? 3 : 2.2;

            return (
              <g key={id}>
                {/* Glow for active */}
                {isActive && (
                  <circle cx={pos.x} cy={pos.y} r={6}
                    fill={M.neural} opacity={0.15}>
                    <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.05;0.2" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={pos.x} cy={pos.y} r={radius}
                  fill={color} opacity={status === "idle" ? 0.3 : 0.9}
                  stroke={isActive ? M.neural : "none"} strokeWidth={0.5}
                />
                <text x={pos.x} y={pos.y + 6} textAnchor="middle"
                  fill={status === "idle" ? M.textDim : color}
                  fontSize="3" fontFamily="monospace"
                  opacity={status === "idle" ? 0.3 : 0.8}
                >
                  {def.short}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Growth metrics */}
      {metrics && (
        <div style={{
          padding: "6px 10px",
          borderTop: `1px solid ${M.border}`,
          display: "flex", gap: 8, justifyContent: "center",
        }}>
          <Metric label="Sessions" value={metrics.totalSessions} color={M.neural} />
          <Metric label="Messages" value={metrics.totalMessages} color={M.antithesis} />
          <Metric label="Knowledge" value={metrics.totalKnowledge} color={M.thesis} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 12, color, fontFamily: "monospace", fontWeight: 700 }}>
        {value || 0}
      </div>
      <div style={{ fontSize: 6, color: M.textDim, fontFamily: "monospace", letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  );
}
