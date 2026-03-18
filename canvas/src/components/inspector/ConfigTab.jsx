import { M } from "../../theme/mizu.js";
import { CONN_TYPES } from "../../constants/connections.js";
import { pingOllama } from "../../api/ollama.js";
import Label from "../shared/Label.jsx";

export default function ConfigTab({
  ollamaEndpoint,
  setOllamaEndpoint,
  defaultModel,
  setDefaultModel,
  ollama,
  dispatch,
}) {
  return (
    <div style={{ padding: 12 }}>
      <Label>OLLAMA ENDPOINT</Label>
      <input
        value={ollamaEndpoint}
        onChange={(e) => setOllamaEndpoint(e.target.value)}
        style={{
          width: "100%",
          padding: "5px 8px",
          background: M.ink2,
          border: `1px solid ${M.border}`,
          borderRadius: 4,
          color: M.text,
          fontSize: 9,
          fontFamily: "monospace",
          boxSizing: "border-box",
          marginBottom: 8,
        }}
      />

      <Label>DEFAULT ORCHESTRATION MODEL</Label>
      <input
        value={defaultModel}
        onChange={(e) => setDefaultModel(e.target.value)}
        style={{
          width: "100%",
          padding: "5px 8px",
          background: M.ink2,
          border: `1px solid ${M.border}`,
          borderRadius: 4,
          color: M.text,
          fontSize: 9,
          fontFamily: "monospace",
          boxSizing: "border-box",
          marginBottom: 8,
        }}
      />

      <button
        onClick={() =>
          pingOllama(ollamaEndpoint).then((s) =>
            dispatch({ type: "SET_OLLAMA", status: s })
          )
        }
        style={{
          width: "100%",
          padding: 6,
          background: `${M.neural}18`,
          border: `1px solid ${M.neural}44`,
          borderRadius: 4,
          color: M.neural,
          cursor: "pointer",
          fontSize: 9,
          fontFamily: "monospace",
          marginBottom: 12,
        }}
      >
        ⟳ TEST CONNECTION
      </button>

      {ollama.ok === false && (
        <div
          style={{
            padding: 8,
            background: `${M.error}11`,
            border: `1px solid ${M.error}33`,
            borderRadius: 4,
            fontSize: 8,
            color: M.error,
            lineHeight: 1.8,
            marginBottom: 10,
          }}
        >
          Cannot reach Ollama. Ensure:
          <br />
          1. Ollama is running: <code>ollama serve</code>
          <br />
          2. OLLAMA_ORIGINS allows this origin
          <br />
          3. Port 11434 is accessible
          <br />
          4. If using Docker, check CORS env var
        </div>
      )}

      {ollama.models.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Label>AVAILABLE MODELS (click to set default)</Label>
          {ollama.models.map((m) => (
            <div
              key={m}
              onClick={() => setDefaultModel(m)}
              style={{
                padding: "3px 8px",
                marginBottom: 2,
                background: defaultModel === m ? `${M.neural}18` : M.ink2,
                border: `1px solid ${defaultModel === m ? M.neural : M.border}`,
                borderRadius: 3,
                fontSize: 9,
                color: defaultModel === m ? M.neural : M.text,
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              {m}
            </div>
          ))}
        </div>
      )}

      <Label>CONNECTION TYPES</Label>
      {Object.entries(CONN_TYPES).map(([k, v]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <div style={{ width: 20, height: 2, background: v.color, borderRadius: 1 }} />
          <span style={{ fontSize: 8, color: v.color, fontFamily: "monospace" }}>{v.label}</span>
        </div>
      ))}

      <div
        style={{
          marginTop: 12,
          padding: 8,
          background: `${M.synthesis}0D`,
          border: `1px solid ${M.synthesis}33`,
          borderRadius: 4,
        }}
      >
        <div style={{ fontSize: 8, color: M.synthesis, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>
          SECURITY
        </div>
        <div style={{ fontSize: 8, color: M.textDim, lineHeight: 1.8 }}>
          Ollama: bind to 127.0.0.1 only
          <br />
          OpenClaw: access via Tailscale VPN
          <br />
          Never expose :11434 or :18789 publicly
          <br />
          CoRax kill switch: always operational
        </div>
      </div>
    </div>
  );
}
