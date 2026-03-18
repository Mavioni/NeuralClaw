// ── OpenClaw Gateway WebSocket Client ─────────────────────────────────
// Connects to the OpenClaw agent runtime for chat sessions with
// brain-region agent orchestration, tool execution, and persistence.
//
// Protocol:
//   Client → Server:  { type, session_id, ... }
//   Server → Client:  { type, ... } (streaming events)
//
// Supports both gateway mode (OpenClaw running) and direct mode
// (fallback to TRIT-TRT / Ollama when gateway is offline).

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000];

export class OpenClawClient {
  constructor(endpoint = "ws://localhost:18789", token = null) {
    this.endpoint = endpoint;
    this.token = token;
    this.ws = null;
    this._connected = false;
    this._listeners = {};
    this._reconnectAttempt = 0;
    this._sessionId = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const url = `${this.endpoint}/ws`;
      const protocols = this.token ? ["bearer", this.token] : [];

      try {
        this.ws = new WebSocket(url, protocols.length ? protocols : undefined);
      } catch (e) {
        reject(new Error(`Cannot create WebSocket: ${e.message}`));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
        this.ws?.close();
      }, 5000);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        this._connected = true;
        this._reconnectAttempt = 0;
        this._emit("connected");
        resolve();
      };

      this.ws.onclose = (e) => {
        clearTimeout(timeout);
        this._connected = false;
        this._emit("disconnected", { code: e.code, reason: e.reason });
      };

      this.ws.onerror = () => {
        clearTimeout(timeout);
        this._connected = false;
        reject(new Error(`WebSocket error connecting to ${url}`));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._emit(data.type, data);
          this._emit("message", data);
        } catch {
          // skip malformed messages
        }
      };
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this._connected = false;
    }
  }

  get isConnected() {
    return this._connected && this.ws?.readyState === WebSocket.OPEN;
  }

  // ── Session management ─────────────────────────────────
  async createSession(sessionId = null) {
    this._sessionId = sessionId || crypto.randomUUID();
    this._send({
      type: "session.create",
      session_id: this._sessionId,
    });
    return this._sessionId;
  }

  async resumeSession(sessionId) {
    this._sessionId = sessionId;
    this._send({
      type: "session.resume",
      session_id: sessionId,
    });
    return sessionId;
  }

  // ── Chat ───────────────────────────────────────────────
  sendMessage(content, context = {}) {
    this._send({
      type: "chat.message",
      session_id: this._sessionId,
      content,
      context,
    });
  }

  cancel() {
    this._send({
      type: "chat.cancel",
      session_id: this._sessionId,
    });
  }

  // ── Tool approval ──────────────────────────────────────
  approveToolCall(callId) {
    this._send({
      type: "tool.approve",
      session_id: this._sessionId,
      call_id: callId,
    });
  }

  denyToolCall(callId) {
    this._send({
      type: "tool.deny",
      session_id: this._sessionId,
      call_id: callId,
    });
  }

  // ── Internal ───────────────────────────────────────────
  _send(data) {
    if (!this.isConnected) return;
    this.ws.send(JSON.stringify(data));
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((f) => f !== fn);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach((fn) => fn(data));
  }
}

// ── Health check ─────────────────────────────────────────
export async function pingOpenClaw(endpoint = "http://localhost:18789", token = null) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const r = await fetch(`${endpoint}/health`, {
      headers,
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return { ok: false };
    const d = await r.json();
    return { ok: true, version: d.version || "unknown", agents: d.agents || 0 };
  } catch {
    return { ok: false };
  }
}
