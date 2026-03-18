import { M } from "../../theme/mizu.js";

export default function Label({ children }) {
  return (
    <div
      style={{
        fontSize: 8,
        color: M.textDim,
        letterSpacing: 1.5,
        marginBottom: 5,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}
