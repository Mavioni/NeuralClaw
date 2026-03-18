import { useState, useEffect, useRef, useCallback } from "react";
import { M } from "../../theme/mizu.js";
import { runChatPipeline } from "../../engine/chat-pipeline.js";
import {
  loadSessions, saveSession, loadMessages, saveMessages,
  loadKnowledge, loadBrainMetrics, updateBrainMetrics,
} from "../../api/memory.js";
import ChatMessage from "./ChatMessage.jsx";
import ChatInput from "./ChatInput.jsx";
import BrainActivity from "./BrainActivity.jsx";
import MemoryPanel from "./MemoryPanel.jsx";

export default function ChatMode({ config }) {
  // ── State ──────────────────────────────────────────────
  const [sessions, setSessions] = useState(() => loadSessions());
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [brainActivity, setBrainActivity] = useState({});
  const [currentPhase, setCurrentPhase] = useState(null);
  const [knowledge, setKnowledge] = useState(() => loadKnowledge());
  const [metrics, setMetrics] = useState(() => loadBrainMetrics());
  const scrollRef = useRef();
  const abortRef = useRef(null);

  // ── Auto-scroll ────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Create or resume session ───────────────────────────
  useEffect(() => {
    if (!sessionId) {
      const existing = loadSessions();
      if (existing.length > 0) {
        resumeSession(existing[0].id);
      } else {
        createNewSession();
      }
    }
  }, []);

  const createNewSession = useCallback(() => {
    const id = crypto.randomUUID();
    const session = {
      id,
      title: "New Session",
      created: Date.now(),
      lastActive: Date.now(),
      messageCount: 0,
    };
    saveSession(session);
    setSessionId(id);
    setMessages([{
      id: crypto.randomUUID(),
      role: "system",
      content: "New session started. Your brain is ready.",
      timestamp: Date.now(),
    }]);
    setSessions(loadSessions());
    setMetrics(updateBrainMetrics({ sessionStarted: true }));
    setBrainActivity({});
    setCurrentPhase(null);
  }, []);

  const resumeSession = useCallback((id) => {
    const msgs = loadMessages(id);
    setSessionId(id);
    setMessages(msgs.length > 0 ? msgs : [{
      id: crypto.randomUUID(),
      role: "system",
      content: "Session resumed.",
      timestamp: Date.now(),
    }]);
    setBrainActivity({});
    setCurrentPhase(null);
  }, []);

  // ── Send message ───────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (!sessionId || thinking) return;

    // Add user message
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    // Add placeholder for assistant
    const assistantId = crypto.randomUUID();
    const assistantMsg = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      streaming: true,
      agents: [],
      toolCalls: [],
    };

    const updatedMessages = [...messages, userMsg, assistantMsg];
    setMessages(updatedMessages);
    setThinking(true);
    setBrainActivity({});
    setCurrentPhase(null);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const result = await runChatPipeline({
        message: text,
        sessionId,
        history: messages.filter((m) => m.role !== "system"),
        config,
        signal: abortController.signal,

        onBrainActivity: ({ agent, phase, status }) => {
          setBrainActivity((prev) => ({ ...prev, [agent]: status }));
        },

        onPhaseChange: (phase) => {
          setCurrentPhase(phase);
        },

        onToken: (chunk, accumulated) => {
          setMessages((prev) => prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: accumulated, streaming: true }
              : m
          ));
        },

        onToolCall: (toolCall) => {
          setMessages((prev) => prev.map((m) =>
            m.id === assistantId
              ? { ...m, toolCalls: [...(m.toolCalls || []), toolCall] }
              : m
          ));
        },

        onKnowledge: (event) => {
          setKnowledge(loadKnowledge());
          setMetrics(loadBrainMetrics());
        },
      });

      // Finalize the assistant message
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId
          ? {
              ...m,
              content: result.text,
              streaming: false,
              agents: result.activatedAgents,
              duration: result.duration,
              memoriesUsed: result.memoriesUsed,
            }
          : m
      ));

      // Persist
      setMessages((prev) => {
        const final = prev;
        saveMessages(sessionId, final);
        // Update session metadata
        const title = text.length > 40 ? text.slice(0, 40) + "..." : text;
        saveSession({
          id: sessionId,
          title: sessions.find((s) => s.id === sessionId)?.title === "New Session"
            ? title : sessions.find((s) => s.id === sessionId)?.title || title,
          created: sessions.find((s) => s.id === sessionId)?.created || Date.now(),
          lastActive: Date.now(),
          messageCount: final.filter((m) => m.role !== "system").length,
        });
        setSessions(loadSessions());
        return final;
      });

    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `[Error] ${err.message}`, streaming: false }
            : m
        ));
      }
    } finally {
      setThinking(false);
      setCurrentPhase(null);
      abortRef.current = null;
      setMetrics(loadBrainMetrics());
    }
  }, [sessionId, thinking, messages, config, sessions]);

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", flex: 1, overflow: "hidden",
    }}>
      {/* Left sidebar: Brain Activity */}
      <div style={{
        width: 200, flexShrink: 0,
        background: M.ink, borderRight: `1px solid ${M.border}`,
        display: "flex", flexDirection: "column",
        padding: 8, gap: 8, overflow: "auto",
      }}>
        <BrainActivity
          activity={brainActivity}
          phase={currentPhase}
          metrics={metrics}
        />

        {/* Pipeline phases */}
        {thinking && currentPhase && (
          <div style={{
            background: M.surface, borderRadius: 6,
            border: `1px solid ${M.border}`,
            padding: 8,
          }}>
            <span style={{
              fontSize: 7, color: M.textDim, fontFamily: "monospace",
              letterSpacing: 1.5,
            }}>
              PIPELINE
            </span>
            <div style={{ marginTop: 6 }}>
              {["RAS", "THL", "WERNICKE", "HIPPO", "PFC", "BROCA", "OUT"].map((id) => {
                const status = brainActivity[id];
                return (
                  <div key={id} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "2px 0",
                  }}>
                    <div style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: status === "active" ? M.neural :
                                 status === "done" ? M.success : M.dim,
                      boxShadow: status === "active" ? `0 0 4px ${M.neural}` : "none",
                    }} />
                    <span style={{
                      fontSize: 8, fontFamily: "monospace",
                      color: status === "active" ? M.neural :
                             status === "done" ? M.success : M.textDim,
                    }}>
                      {id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Center: Chat */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: M.deep, overflow: "hidden",
      }}>
        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflow: "auto",
            padding: "8px 0",
          }}
        >
          {/* Welcome state */}
          {messages.length <= 1 && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", padding: 40, opacity: 0.6,
            }}>
              <div style={{
                fontSize: 40, opacity: 0.15, marginBottom: 16,
              }}>
                ◈
              </div>
              <div style={{
                fontSize: 12, color: M.textDim, textAlign: "center",
                fontFamily: "'Courier New', monospace", lineHeight: 1.6,
              }}>
                Your brain is ready.
              </div>
              <div style={{
                fontSize: 10, color: M.textDim, textAlign: "center",
                fontFamily: "'Courier New', monospace",
                marginTop: 4, opacity: 0.5,
              }}>
                Messages flow through {Object.keys(brainActivity).length > 0 ? "active" : "16"} brain regions.
                <br />Knowledge persists across sessions.
              </div>
              {metrics && metrics.totalSessions > 1 && (
                <div style={{
                  fontSize: 9, color: M.neural, textAlign: "center",
                  fontFamily: "monospace", marginTop: 12,
                }}>
                  Brain has {metrics.totalKnowledge} memories across {metrics.totalSessions} sessions
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>

        <ChatInput onSend={handleSend} disabled={thinking} />
      </div>

      {/* Right sidebar: Memory */}
      <div style={{
        width: 220, flexShrink: 0,
        background: M.ink, borderLeft: `1px solid ${M.border}`,
        overflow: "auto", padding: 8,
      }}>
        <MemoryPanel
          knowledge={knowledge}
          metrics={metrics}
          sessions={sessions}
          currentSessionId={sessionId}
          onSelectSession={resumeSession}
          onNewSession={createNewSession}
        />
      </div>
    </div>
  );
}
