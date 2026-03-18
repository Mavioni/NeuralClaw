import { uid } from "../utils/helpers.js";

// ── Initial State ────────────────────────────────────────────────────
export const initialState = {
  nodes: {},
  connections: [],
  selected: null,
  connecting: null,
  running: false,
  log: [],
  ollama: { ok: null, models: [] },
  tritTrt: { ok: null, busy: false },
};

// ── Reducer ──────────────────────────────────────────────────────────
export function reducer(s, a) {
  switch (a.type) {
    case "ADD_NODE":
      return { ...s, nodes: { ...s.nodes, [a.node.id]: a.node } };
    case "MOVE_NODE":
      return {
        ...s,
        nodes: { ...s.nodes, [a.id]: { ...s.nodes[a.id], x: a.x, y: a.y } },
      };
    case "SELECT":
      return { ...s, selected: a.id };
    case "DELETE_NODE": {
      const { [a.id]: _, ...rest } = s.nodes;
      return {
        ...s,
        nodes: rest,
        connections: s.connections.filter(
          (c) => c.from !== a.id && c.to !== a.id
        ),
        selected: null,
      };
    }
    case "START_CONNECT":
      return { ...s, connecting: { nodeId: a.nodeId } };
    case "FINISH_CONNECT": {
      if (!s.connecting) return s;
      if (s.connecting.nodeId === a.toId) return { ...s, connecting: null };
      const exists = s.connections.find(
        (c) => c.from === s.connecting.nodeId && c.to === a.toId
      );
      const conn = {
        id: uid(),
        from: s.connecting.nodeId,
        to: a.toId,
        type: "EXCITATORY",
      };
      return {
        ...s,
        connecting: null,
        connections: exists ? s.connections : [...s.connections, conn],
      };
    }
    case "CANCEL_CONNECT":
      return { ...s, connecting: null };
    case "SET_NODE":
      return {
        ...s,
        nodes: { ...s.nodes, [a.id]: { ...s.nodes[a.id], ...a.patch } },
      };
    case "SET_CONN_TYPE":
      return {
        ...s,
        connections: s.connections.map((c) =>
          c.id === a.id ? { ...c, type: a.ct } : c
        ),
      };
    case "DELETE_CONN":
      return {
        ...s,
        connections: s.connections.filter((c) => c.id !== a.id),
      };
    case "SET_TRIT": {
      const vec = [...(s.nodes[a.nodeId].tritVector || [0, 0, 0])];
      vec[a.dim] = a.val;
      return {
        ...s,
        nodes: {
          ...s.nodes,
          [a.nodeId]: { ...s.nodes[a.nodeId], tritVector: vec },
        },
      };
    }
    case "SET_GOV":
      return {
        ...s,
        nodes: {
          ...s.nodes,
          [a.nodeId]: { ...s.nodes[a.nodeId], governance: a.val },
        },
      };
    case "LOG":
      return {
        ...s,
        log: [...s.log.slice(-149), { t: Date.now(), ...a.entry }],
      };
    case "SET_RUNNING":
      return { ...s, running: a.val };
    case "SET_OLLAMA":
      return { ...s, ollama: a.status };
    case "SET_TRIT_TRT":
      return { ...s, tritTrt: a.status };
    default:
      return s;
  }
}
