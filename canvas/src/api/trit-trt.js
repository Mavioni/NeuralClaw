// ── TRIT-TRT WebSocket Inference API ─────────────────────────────────
// Connects to the trit-trt FastAPI server's WebSocket endpoint for
// ternary dialectical inference (BitNet b1.58 + TRT reasoning loop).
//
// Protocol:
//   Client → Server:  { type: "generate", prompt, settings }
//   Server → Client:  { type: "status"|"candidates"|"selected"|"insight"|"result"|"error" }

export const TRT_DEFAULTS = {
  rounds: 3,
  candidates: 8,
  max_tokens: 512,
  temperature: 0.6,
  selection_method: "self_consistency",
  reflection_depth: "standard",
  early_stop_threshold: 0.95,
  knowledge_persistence: true,
};

export class TritTRTClient {
  constructor(endpoint = "ws://localhost:8765/ws") {
    this.endpoint = endpoint;
    this.ws = null;
    this._listeners = {};
    this._connected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.endpoint);
      } catch (e) {
        reject(new Error(`Cannot create WebSocket: ${e.message}`));
        return;
      }

      this.ws.onopen = () => {
        this._connected = true;
        this._emit("connected");
        resolve();
      };

      this.ws.onclose = () => {
        this._connected = false;
        this._emit("disconnected");
      };

      this.ws.onerror = () => {
        this._connected = false;
        reject(new Error(`WebSocket error connecting to ${this.endpoint}`));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._emit(data.type, data);
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

  /**
   * Generate a response using the TRT dialectical reasoning loop.
   * Returns a Promise that resolves with the final TRTResult.
   * Emits events for each phase: status, candidates, selected, insight, result.
   */
  generate(prompt, settings = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Not connected to trit-trt server"));
        return;
      }

      const mergedSettings = { ...TRT_DEFAULTS, ...settings };

      // Set up one-time result/error handlers
      const cleanup = () => {
        this.off("result", onResult);
        this.off("error", onError);
        this.off("cancelled", onCancelled);
      };

      const onResult = (data) => {
        cleanup();
        resolve(data);
      };
      const onError = (data) => {
        cleanup();
        reject(new Error(data.message || "TRT inference error"));
      };
      const onCancelled = () => {
        cleanup();
        reject(new Error("Generation cancelled"));
      };

      this.on("result", onResult);
      this.on("error", onError);
      this.on("cancelled", onCancelled);

      this.ws.send(JSON.stringify({
        type: "generate",
        prompt,
        settings: mergedSettings,
      }));
    });
  }

  cancel() {
    if (this.isConnected) {
      this.ws.send(JSON.stringify({ type: "cancel" }));
    }
  }

  // ── Event emitter ──────────────────────────────────────
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((f) => f !== fn);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach((fn) => fn(data));
  }
}

/**
 * Ping the trit-trt REST health endpoint.
 */
export async function pingTritTRT(httpEndpoint = "http://localhost:8765") {
  try {
    const r = await fetch(`${httpEndpoint}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return { ok: false, busy: false };
    const d = await r.json();
    return { ok: true, busy: d.busy || false };
  } catch {
    return { ok: false, busy: false };
  }
}

/**
 * Convenience: run a single TRT inference over WebSocket.
 * Connects, generates, disconnects.
 */
export async function callTritTRT(
  wsEndpoint,
  prompt,
  settings = {},
  onPhase = null
) {
  const client = new TritTRTClient(wsEndpoint);

  if (onPhase) {
    client.on("status", onPhase);
    client.on("candidates", onPhase);
    client.on("selected", onPhase);
    client.on("insight", onPhase);
  }

  await client.connect();

  try {
    const result = await client.generate(prompt, settings);
    return result;
  } finally {
    client.disconnect();
  }
}
