import { CONN_TYPES } from "../../constants/connections.js";

export default function Conn({ c, nodes, onDel }) {
  const a = nodes[c.from];
  const b = nodes[c.to];
  if (!a || !b) return null;
  const ct = CONN_TYPES[c.type] || CONN_TYPES.EXCITATORY;
  const x1 = a.x + 195,
    y1 = a.y + 50,
    x2 = b.x - 7,
    y2 = b.y + 50;
  const cx = (x1 + x2) / 2;
  const d = `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
  return (
    <g>
      {/* Visual path */}
      <path
        d={d}
        fill="none"
        stroke={ct.color}
        strokeWidth={ct.width}
        strokeDasharray={ct.dash || undefined}
        opacity={0.65}
        style={{
          filter: `drop-shadow(0 0 3px ${ct.color}88)`,
          pointerEvents: "none",
        }}
      />
      <circle
        cx={(x1 + x2) / 2}
        cy={(y1 + y2) / 2}
        r={3.5}
        fill={ct.color}
        opacity={0.9}
        style={{ pointerEvents: "none" }}
      />
      {/* Wide transparent hit area */}
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        style={{ cursor: "pointer", pointerEvents: "stroke" }}
        onClick={() => onDel(c.id)}
      />
    </g>
  );
}
