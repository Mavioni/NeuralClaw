import { useState, useRef, useEffect } from "react";
import { M } from "../../theme/mizu.js";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const ref = useRef();

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: "flex", gap: 8, padding: "12px 16px",
      background: M.ink, borderTop: `1px solid ${M.border}`,
      alignItems: "flex-end",
    }}>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Brain is thinking..." : "Talk to your brain..."}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1, padding: "10px 14px",
          background: M.ink2, border: `1px solid ${M.border}`,
          borderRadius: 12, color: M.text, fontSize: 12,
          fontFamily: "'Courier New', monospace",
          resize: "none", outline: "none",
          minHeight: 20, maxHeight: 120,
          lineHeight: 1.4,
          opacity: disabled ? 0.5 : 1,
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => e.target.style.borderColor = M.neural + "60"}
        onBlur={(e) => e.target.style.borderColor = M.border}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        style={{
          width: 38, height: 38,
          background: disabled || !text.trim() ? M.dim : M.neural,
          border: "none", borderRadius: 10,
          color: M.deep, cursor: disabled ? "default" : "pointer",
          fontSize: 14, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
          opacity: disabled || !text.trim() ? 0.4 : 1,
          flexShrink: 0,
        }}
      >
        ▲
      </button>
    </div>
  );
}
