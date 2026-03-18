import { tritColor, tritSym } from "../../utils/helpers.js";

export default function TritBadge({ val, size = 14 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 3,
        background: tritColor(val),
        color: "#fff",
        fontSize: size * 0.6,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {tritSym(val)}
    </span>
  );
}
