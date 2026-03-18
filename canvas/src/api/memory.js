// ── Memory & Persistence Layer ───────────────────────────────────────
// Handles conversation persistence (localStorage) and semantic memory
// (ChromaDB via REST API). The brain "grows" by accumulating knowledge
// entries across sessions.

const STORAGE_PREFIX = "neuralclaw_";
const SESSIONS_KEY = STORAGE_PREFIX + "sessions";
const KNOWLEDGE_KEY = STORAGE_PREFIX + "knowledge";
const METRICS_KEY = STORAGE_PREFIX + "brain_metrics";

// ── Local Storage Persistence ────────────────────────────

export function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  } catch { return []; }
}

export function saveSession(session) {
  const sessions = loadSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  // Keep last 100 sessions
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 100)));
}

export function deleteSession(sessionId) {
  const sessions = loadSessions().filter((s) => s.id !== sessionId);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  localStorage.removeItem(STORAGE_PREFIX + "messages_" + sessionId);
}

export function loadMessages(sessionId) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "messages_" + sessionId) || "[]");
  } catch { return []; }
}

export function saveMessages(sessionId, messages) {
  localStorage.setItem(STORAGE_PREFIX + "messages_" + sessionId, JSON.stringify(messages));
}

// ── Knowledge Store (local) ──────────────────────────────

export function loadKnowledge() {
  try {
    return JSON.parse(localStorage.getItem(KNOWLEDGE_KEY) || "[]");
  } catch { return []; }
}

export function addKnowledge(entry) {
  const knowledge = loadKnowledge();
  knowledge.unshift({
    id: crypto.randomUUID(),
    text: entry.text,
    source: entry.source || "chat",
    confidence: entry.confidence || 0.5,
    sessionId: entry.sessionId,
    timestamp: Date.now(),
    accessCount: 0,
  });
  // Keep last 500 entries
  localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(knowledge.slice(0, 500)));
  updateBrainMetrics({ knowledgeAdded: 1 });
  return knowledge[0];
}

export function queryKnowledge(queryText, limit = 5) {
  const knowledge = loadKnowledge();
  // Simple keyword matching — ChromaDB handles semantic search
  const words = queryText.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  return knowledge
    .map((k) => {
      const text = k.text.toLowerCase();
      const score = words.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0) / Math.max(words.length, 1);
      return { ...k, relevance: score * k.confidence };
    })
    .filter((k) => k.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

// ── Brain Growth Metrics ─────────────────────────────────

export function loadBrainMetrics() {
  try {
    return JSON.parse(localStorage.getItem(METRICS_KEY) || "null") || defaultMetrics();
  } catch { return defaultMetrics(); }
}

function defaultMetrics() {
  return {
    totalSessions: 0,
    totalMessages: 0,
    totalKnowledge: 0,
    agentActivations: {},
    firstSession: null,
    lastSession: null,
  };
}

export function updateBrainMetrics(update) {
  const m = loadBrainMetrics();

  if (update.sessionStarted) {
    m.totalSessions++;
    if (!m.firstSession) m.firstSession = Date.now();
    m.lastSession = Date.now();
  }
  if (update.messageSent) m.totalMessages++;
  if (update.knowledgeAdded) m.totalKnowledge += update.knowledgeAdded;
  if (update.agentActivated) {
    m.agentActivations[update.agentActivated] =
      (m.agentActivations[update.agentActivated] || 0) + 1;
  }

  localStorage.setItem(METRICS_KEY, JSON.stringify(m));
  return m;
}

// ── ChromaDB REST Client ─────────────────────────────────
// For semantic memory when ChromaDB is available

export class ChromaMemory {
  constructor(endpoint = "http://localhost:8000", token = null) {
    this.endpoint = endpoint;
    this.token = token;
    this.collection = "neuralclaw_memory";
  }

  async _fetch(path, options = {}) {
    const headers = { "Content-Type": "application/json" };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const r = await fetch(`${this.endpoint}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) throw new Error(`ChromaDB ${r.status}`);
    return r.json();
  }

  async ping() {
    try {
      await this._fetch("/api/v1/heartbeat");
      return true;
    } catch { return false; }
  }

  async ensureCollection() {
    try {
      await this._fetch("/api/v1/collections", {
        method: "POST",
        body: JSON.stringify({
          name: this.collection,
          metadata: { "hnsw:space": "cosine" },
        }),
      });
    } catch {
      // Collection may already exist
    }
  }

  async store(id, text, metadata = {}) {
    await this._fetch(`/api/v1/collections/${this.collection}/add`, {
      method: "POST",
      body: JSON.stringify({
        ids: [id],
        documents: [text],
        metadatas: [{ ...metadata, timestamp: Date.now() }],
      }),
    });
  }

  async query(text, nResults = 5) {
    const result = await this._fetch(`/api/v1/collections/${this.collection}/query`, {
      method: "POST",
      body: JSON.stringify({
        query_texts: [text],
        n_results: nResults,
      }),
    });
    return (result.documents?.[0] || []).map((doc, i) => ({
      text: doc,
      metadata: result.metadatas?.[0]?.[i] || {},
      distance: result.distances?.[0]?.[i] || 0,
    }));
  }
}
