import { M } from "../theme/mizu.js";
import InspectorTab from "./inspector/InspectorTab.jsx";
import LogTab from "./inspector/LogTab.jsx";
import ConfigTab from "./inspector/ConfigTab.jsx";

export default function InspectorPanel({
  tab,
  setTab,
  sel,
  dispatch,
  log,
  logRef,
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
}) {
  return (
    <div
      style={{
        width: 258,
        background: M.ink,
        borderLeft: `1px solid ${M.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${M.border}` }}>
        {["inspector", "log", "config"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "6px 0",
              background: tab === t ? M.ink2 : "transparent",
              border: "none",
              color: tab === t ? M.text : M.textDim,
              cursor: "pointer",
              fontSize: 8,
              letterSpacing: 1.5,
              fontFamily: "monospace",
              textTransform: "uppercase",
              borderBottom: tab === t ? `2px solid ${M.neural}` : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {tab === "inspector" && <div style={{ padding: 12 }}><InspectorTab sel={sel} dispatch={dispatch} /></div>}
        {tab === "log" && <LogTab log={log} logRef={logRef} />}
        {tab === "config" && (
          <ConfigTab
            ollamaEndpoint={ollamaEndpoint}
            setOllamaEndpoint={setOllamaEndpoint}
            defaultModel={defaultModel}
            setDefaultModel={setDefaultModel}
            ollama={ollama}
            tritTrtEndpoint={tritTrtEndpoint}
            setTritTrtEndpoint={setTritTrtEndpoint}
            tritTrt={tritTrt}
            trtRounds={trtRounds}
            setTrtRounds={setTrtRounds}
            trtCandidates={trtCandidates}
            setTrtCandidates={setTrtCandidates}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  );
}
