import { M } from "../../theme/mizu.js";
import { CONN_TYPES } from "../../constants/connections.js";
import { pingOllama } from "../../api/ollama.js";
import { pingTritTRT } from "../../api/trit-trt.js";
import Label from "../shared/Label.jsx";

const inputStyle = {
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
};

export default function ConfigTab({
  ollamaEndpoint,
  setOllamaEndpoint,
  defaultModel,
  setDefaultModel,
  ollama,
  tritTrtEndpoint,
  setTritTrtEndpoint,
  tritTrt,
  trtRounds,
  setTrtRounds,
  trtCandidates,
  setTrtCandidates,
  dispatch,
}) {
  return (
    <div style={{ padding: 12 }}>
      {/* ── TRIT-TRT (Primary Backend) ──────────────────────── */}
      <div
        style={{
          marginBottom: 12,
          padding: 8,
          background: `${M.neural}0A`,
          border: `1px solid ${M.neural}33`,
          borderRadius: 4,
        }}
      >
        <div style={{ fontSize: 8, color: M.neural, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
          TRIT-TRT · PRIMARY BACKEND
        </div>
        <div style={{ fontSize: 7, color: M.textDim, marginBottom: 6, lineHeight: 1.6 }}>
          BitNet b1.58 ternary quantization + TRT dialectical reasoning.
          Weights: {"{-1, 0, +1}"} — thesis, antithesis, synthesis.
        </div>

        <Label>TRIT-TRT ENDPOINT</Label>
        <input
          value={tritTrtEndpoint}
          onChange={(e) => setTritTrtEndpoint(e.target.value)}
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <Label>TRT ROUNDS</Label>
            <input
              type="number"
              min={1}
              max={5}
              value={trtRounds}
              onChange={(e) => setTrtRounds(parseInt(e.target.value) || 3)}
              style={{ ...inputStyle, width: "100%", marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Label>CANDIDATES</Label>
            <input
              type="number"
              min={2}
              max={16}
              value={trtCandidates}
              onChange={(e) => setTrtCandidates(parseInt(e.target.value) || 8)}
              style={{ ...inputStyle, width: "100%", marginBottom: 0 }}
            />
          </div>
        </div>

        <button
          onClick={() =>
            pingTritTRT(tritTrtEndpoint).then((s) =>
              dispatch({ type: "SET_TRIT_TRT", status: s })
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
            marginBottom: 4,
          }}
        >
          ⟳ TEST TRIT-TRT
        </button>

        {tritTrt?.ok === false && (
          <div
            style={{
              padding: 6,
              background: `${M.error}11`,
              border: `1px solid ${M.error}33`,
              borderRadius: 4,
              fontSize: 7,
              color: M.error,
              lineHeight: 1.8,
              marginTop: 4,
            }}
          >
            Cannot reach TRIT-TRT. Agents will fall back to Ollama.
            <br />
            Start with: <code>cd trit-trt && python -m uvicorn ui.app:app --port 8765</code>
          </div>
        )}

        {tritTrt?.ok === true && (
          <div style={{ fontSize: 7, color: M.neural, marginTop: 4 }}>
            Connected · BitNet-b1.58-2B-4T · {trtRounds} rounds × {trtCandidates} candidates
          </div>
        )}
      </div>

      {/* ── Ollama (Fallback Backend) ───────────────────────── */}
      <Label>OLLAMA ENDPOINT (FALLBACK)</Label>
      <input
        value={ollamaEndpoint}
        onChange={(e) => setOllamaEndpoint(e.target.value)}
        style={inputStyle}
      />

      <Label>DEFAULT FALLBACK MODEL</Label>
      <input
        value={defaultModel}
        onChange={(e) => setDefaultModel(e.target.value)}
        style={inputStyle}
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
          background: `${M.dim}`,
          border: `1px solid ${M.border}`,
          borderRadius: 4,
          color: M.textDim,
          cursor: "pointer",
          fontSize: 9,
          fontFamily: "monospace",
          marginBottom: 12,
        }}
      >
        ⟳ TEST OLLAMA
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
          Ollama offline. No fallback available.
        </div>
      )}

      {ollama.models.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Label>OLLAMA MODELS (click to set fallback)</Label>
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
          TRIT-TRT: bind to 127.0.0.1:8765 only
          <br />
          Ollama: bind to 127.0.0.1:11434 only
          <br />
          OpenClaw: access via Tailscale VPN
          <br />
          CoRax kill switch: always operational
        </div>
      </div>
    </div>
  );
}
