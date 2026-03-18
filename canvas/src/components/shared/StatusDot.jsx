import { M } from "../../theme/mizu.js";

const STATUS_COLORS = {
  idle: M.dim,
  running: M.myelin,
  done: M.success,
  error: M.error,
  restricted: M.thesis,
};

export default function StatusDot({ status }) {
  const pulse = status === "running";
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: STATUS_COLORS[status] || M.dim,
        flexShrink: 0,
        boxShadow: pulse ? `0 0 8px ${M.myelin}` : undefined,
        transition: "background 0.3s",
      }}
    />
  );
}
