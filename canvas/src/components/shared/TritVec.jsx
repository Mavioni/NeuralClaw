import TritBadge from "./TritBadge.jsx";

export default function TritVec({ vec = [0, 0, 0] }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {vec.map((v, i) => (
        <TritBadge key={i} val={v} />
      ))}
    </div>
  );
}
