import { useState, useEffect, useRef, useReducer } from "react";
import { M } from "./theme/mizu.js";
import { uid } from "./utils/helpers.js";
import { AGENTS } from "./constants/agents.js";
import { pingOllama } from "./api/ollama.js";
import { pingTritTRT } from "./api/trit-trt.js";
import { reducer, initialState } from "./state/reducer.js";
import { runWorkflow } from "./engine/workflow.js";
import TopBar from "./components/TopBar.jsx";
import NodePalette from "./components/NodePalette.jsx";
import InspectorPanel from "./components/InspectorPanel.jsx";
import StatusBar from "./components/StatusBar.jsx";
import CNode from "./components/nodes/CNode.jsx";
import Conn from "./components/connections/Conn.jsx";

export default function NeuralClaw() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const canvasRef = useRef();
  const dragRef = useRef(null);
  const logRef = useRef();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [tab, setTab] = useState("inspector");
  const [ollamaEndpoint, setOllamaEndpoint] = useState("http://localhost:11434");
  const [tritTrtEndpoint, setTritTrtEndpoint] = useState("http://localhost:8765");
  const [defaultModel, setDefaultModel] = useState("llama3.2");
  const [trtRounds, setTrtRounds] = useState(3);
  const [trtCandidates, setTrtCandidates] = useState(8);
  const [workflowInput, setWorkflowInput] = useState("");
  const ollamaRef = useRef(ollamaEndpoint);
  const modelRef = useRef(defaultModel);
  const tritTrtRef = useRef(tritTrtEndpoint);
  useEffect(() => { ollamaRef.current = ollamaEndpoint; }, [ollamaEndpoint]);
  useEffect(() => { modelRef.current = defaultModel; }, [defaultModel]);
  useEffect(() => { tritTrtRef.current = tritTrtEndpoint; }, [tritTrtEndpoint]);

  // Ping backends on mount
  useEffect(() => {
    pingOllama(ollamaEndpoint).then((s) =>
      dispatch({ type: "SET_OLLAMA", status: s })
    );
    pingTritTRT(tritTrtEndpoint).then((s) =>
      dispatch({ type: "SET_TRIT_TRT", status: s })
    );
  }, []);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 9999;
  }, [state.log]);

  const log = (node, msg, kind = "info") =>
    dispatch({ type: "LOG", entry: { node: node || "SYS", msg, kind } });

  // ── Drag palette
  const dragStart = (e, agentId) => e.dataTransfer.setData("agentId", agentId);

  const drop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("agentId");
    if (!id || !AGENTS[id]) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const def = AGENTS[id];
    dispatch({
      type: "ADD_NODE",
      node: {
        id: uid(),
        agentType: id,
        x: e.clientX - rect.left - 94,
        y: e.clientY - rect.top - 40,
        tritVector: [...def.tritVector],
        governance: def.governance || 0,
        status: "idle",
        output: null,
      },
    });
  };

  // ── Drag: attach to window so fast drags don't lose tracking
  useEffect(() => {
    const onMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect)
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.sx;
        const dy = e.clientY - dragRef.current.sy;
        dispatch({
          type: "MOVE_NODE",
          id: dragRef.current.nodeId,
          x: dragRef.current.ox + dx,
          y: dragRef.current.oy + dy,
        });
      }
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ── Node drag
  const nodeDown = (e, nodeId) => {
    e.stopPropagation();
    dispatch({ type: "SELECT", id: nodeId });
    if (state.connecting) return;
    const n = state.nodes[nodeId];
    dragRef.current = { nodeId, sx: e.clientX, sy: e.clientY, ox: n.x, oy: n.y };
  };

  const portClick = (nodeId, portType) => {
    if (portType === "out" && !state.connecting) {
      dispatch({ type: "START_CONNECT", nodeId });
    } else if (
      portType === "in" &&
      state.connecting &&
      state.connecting.nodeId !== nodeId
    ) {
      dispatch({ type: "FINISH_CONNECT", toId: nodeId });
    }
  };

  const canvasClick = (e) => {
    if (e.target !== e.currentTarget) return;
    if (state.connecting) dispatch({ type: "CANCEL_CONNECT" });
    dispatch({ type: "SELECT", id: null });
  };

  // ── Workflow execution
  const handleRun = async () => {
    if (state.running) return;
    await runWorkflow({
      nodes: state.nodes,
      connections: state.connections,
      workflowInput,
      ollamaEndpoint: ollamaRef.current,
      defaultModel: modelRef.current,
      tritTrtEndpoint: tritTrtRef.current,
      trtRounds,
      trtCandidates,
      dispatch,
      log,
    });
  };

  const resetAll = () => {
    Object.keys(state.nodes).forEach((id) =>
      dispatch({ type: "SET_NODE", id, patch: { status: "idle", output: null } })
    );
    dispatch({ type: "LOG", entry: { node: "SYS", msg: "Canvas reset.", kind: "info" } });
  };

  const sel = state.selected ? state.nodes[state.selected] : null;

  // ── Render
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: M.deep,
        color: M.text,
        fontFamily: "'Courier New',monospace",
        overflow: "hidden",
      }}
    >
      <TopBar
        ollama={state.ollama}
        tritTrt={state.tritTrt}
        nodeCount={Object.keys(state.nodes).length}
        connectionCount={state.connections.length}
        workflowInput={workflowInput}
        setWorkflowInput={setWorkflowInput}
        running={state.running}
        onRun={handleRun}
        onReset={resetAll}
      />

      {/* MAIN LAYOUT */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <NodePalette onDragStart={dragStart} />

        {/* CENTER: Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <div
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
              backgroundImage: `radial-gradient(circle, ${M.border}55 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
              cursor: state.connecting ? "crosshair" : "default",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={drop}
            onClick={canvasClick}
          >
            {/* SVG layer */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
              {state.connections.map((c) => (
                <Conn
                  key={c.id}
                  c={c}
                  nodes={state.nodes}
                  onDel={(id) => dispatch({ type: "DELETE_CONN", id })}
                />
              ))}
              {/* Live connection preview */}
              {state.connecting &&
                (() => {
                  const fn = state.nodes[state.connecting.nodeId];
                  if (!fn) return null;
                  const x1 = fn.x + 195,
                    y1 = fn.y + 50,
                    x2 = mouse.x,
                    y2 = mouse.y,
                    cx = (x1 + x2) / 2;
                  return (
                    <path
                      d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`}
                      fill="none"
                      stroke={M.neural}
                      strokeWidth={1.5}
                      strokeDasharray="6,3"
                      opacity={0.5}
                      style={{ pointerEvents: "none" }}
                    />
                  );
                })()}
            </svg>

            {/* Nodes */}
            {Object.values(state.nodes).map((node) => (
              <CNode
                key={node.id}
                node={node}
                selected={state.selected === node.id}
                onDown={(e) => nodeDown(e, node.id)}
                onPortClick={portClick}
              />
            ))}

            {/* Empty state */}
            {Object.keys(state.nodes).length === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontSize: 40, opacity: 0.08, marginBottom: 14 }}>◈</div>
                <div style={{ fontSize: 11, color: M.textDim, opacity: 0.4 }}>
                  Drag brain region agents from the palette to build your neural workflow
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: M.textDim,
                    opacity: 0.25,
                    marginTop: 8,
                    letterSpacing: 1,
                  }}
                >
                  SUGGESTED: RAS → THL → PFC → BROCA → OUT
                </div>
              </div>
            )}
          </div>
        </div>

        <InspectorPanel
          tab={tab}
          setTab={setTab}
          sel={sel}
          dispatch={dispatch}
          log={state.log}
          logRef={logRef}
          ollamaEndpoint={ollamaEndpoint}
          setOllamaEndpoint={setOllamaEndpoint}
          defaultModel={defaultModel}
          setDefaultModel={setDefaultModel}
          ollama={state.ollama}
          tritTrtEndpoint={tritTrtEndpoint}
          setTritTrtEndpoint={setTritTrtEndpoint}
          tritTrt={state.tritTrt}
          trtRounds={trtRounds}
          setTrtRounds={setTrtRounds}
          trtCandidates={trtCandidates}
          setTrtCandidates={setTrtCandidates}
        />
      </div>

      <StatusBar
        running={state.running}
        doneCount={Object.values(state.nodes).filter((n) => n.status === "done").length}
        totalCount={Object.keys(state.nodes).length}
      />
    </div>
  );
}
