// ── Chat Brain Pipeline ──────────────────────────────────────────────
// Orchestrates chat through the brain's neural architecture.
// Routes messages through brain regions, streams responses, and
// accumulates knowledge. Works in direct mode (TRIT-TRT / Ollama)
// when OpenClaw gateway is offline.

import { AGENTS } from "../constants/agents.js";
import { callOllama } from "../api/ollama.js";
import { callTritTRT } from "../api/trit-trt.js";
import { addKnowledge, queryKnowledge, updateBrainMetrics } from "../api/memory.js";

// ── Brain region activation order for chat ───────────────
const CHAT_PIPELINE = [
  { agent: "RAS",      phase: "trigger",     label: "Triggering" },
  { agent: "THL",      phase: "routing",     label: "Routing signal" },
  { agent: "WERNICKE", phase: "comprehend",  label: "Comprehending" },
  { agent: "HIPPO",    phase: "memory",      label: "Recalling memories" },
  { agent: "AMYGDALA", phase: "threat",      label: "Threat assessment" },
  { agent: "PFC",      phase: "planning",    label: "Planning response" },
  { agent: "BROCA",    phase: "generating",  label: "Generating speech" },
  { agent: "VTA",      phase: "reward",      label: "Evaluating quality" },
  { agent: "OUT",      phase: "output",      label: "Delivering" },
];

export async function runChatPipeline({
  message,
  sessionId,
  history = [],
  config,
  onBrainActivity,
  onToken,
  onToolCall,
  onPhaseChange,
  onKnowledge,
  signal,
}) {
  let currentOutput = message;
  const activatedAgents = [];
  const startTime = Date.now();

  // Build context from recent history
  const recentHistory = history.slice(-6).map((m) =>
    `${m.role === "user" ? "Human" : "Brain"}: ${m.content.slice(0, 200)}`
  ).join("\n");

  // Check for relevant knowledge
  const memories = queryKnowledge(message, 3);
  const memoryContext = memories.length > 0
    ? "\n\nRelevant memories:\n" + memories.map((m) => `- ${m.text}`).join("\n")
    : "";

  for (const step of CHAT_PIPELINE) {
    if (signal?.aborted) break;

    const def = AGENTS[step.agent];
    if (!def) continue;

    // Notify brain activity
    onBrainActivity?.({ agent: step.agent, phase: step.phase, status: "active" });
    onPhaseChange?.(step);
    updateBrainMetrics({ agentActivated: step.agent });
    activatedAgents.push(step.agent);

    try {
      switch (step.phase) {
        case "trigger":
          // RAS: passthrough — just marks the event
          currentOutput = message;
          break;

        case "routing":
          // THL: quick routing decision (skip full inference for speed)
          currentOutput = message;
          break;

        case "comprehend":
          // WERNICKE: understand the input (skip for simple messages)
          if (message.length > 100) {
            currentOutput = await invokeAgent(
              def, message, config, signal
            );
          }
          break;

        case "memory":
          // HIPPO: inject memory context (no inference needed)
          if (memoryContext) {
            onKnowledge?.({ type: "recall", memories, count: memories.length });
          }
          break;

        case "threat":
          // AMYGDALA: skip for normal chat (fast path)
          break;

        case "planning":
          // PFC: plan the response (skip for conversational messages)
          break;

        case "generating": {
          // BROCA: main response generation — this is the core
          const systemPrompt = buildChatSystemPrompt(recentHistory, memoryContext);
          const response = await invokeMainAgent(
            systemPrompt, message, config, onToken, signal
          );
          currentOutput = response;
          break;
        }

        case "reward":
          // VTA: evaluate response quality (async, non-blocking)
          break;

        case "output":
          // OUT: mark delivery complete
          break;
      }
    } catch (err) {
      if (err.name === "AbortError") break;
      // Continue pipeline on non-fatal errors
      console.warn(`[${step.agent}] ${err.message}`);
    }

    onBrainActivity?.({ agent: step.agent, phase: step.phase, status: "done" });
  }

  // Store knowledge from this exchange
  if (currentOutput && currentOutput !== message) {
    const knowledge = addKnowledge({
      text: `Q: ${message.slice(0, 100)} → A: ${currentOutput.slice(0, 200)}`,
      source: "chat",
      confidence: 0.6,
      sessionId,
    });
    onKnowledge?.({ type: "store", entry: knowledge });
  }

  updateBrainMetrics({ messageSent: true });

  return {
    text: currentOutput,
    activatedAgents,
    duration: Date.now() - startTime,
    memoriesUsed: memories.length,
  };
}

// ── Build system prompt for chat ─────────────────────────
function buildChatSystemPrompt(recentHistory, memoryContext) {
  return `You are NEURAL-CLAW, a sovereign brain-modeled AI system. You process information through a biological neural architecture with specialized brain regions.

You think dialectically — every question has a thesis, antithesis, and synthesis. Your responses are direct, intelligent, and reflect the accumulated knowledge of your brain.

${recentHistory ? `Recent conversation:\n${recentHistory}\n` : ""}${memoryContext}

Respond naturally and conversationally. Be helpful, concise, and show genuine understanding. If you've learned something relevant from previous conversations, reference it naturally.`;
}

// ── Invoke the main response agent (BROCA) ───────────────
async function invokeMainAgent(systemPrompt, input, config, onToken, signal) {
  const backend = config.tritTrt?.ok ? "trit-trt" : "ollama";

  if (backend === "trit-trt") {
    try {
      const wsEndpoint = config.tritTrtEndpoint.replace(/^http/, "ws") + "/ws";
      const result = await callTritTRT(wsEndpoint, `${systemPrompt}\n\nUser: ${input}`, {
        rounds: config.trtRounds || 2,
        candidates: config.trtCandidates || 4,
        max_tokens: 1024,
        temperature: 0.7,
        selection_method: "hybrid",
        reflection_depth: "standard",
      }, (phase) => {
        if (phase.type === "selected" && onToken) {
          onToken(phase.text, phase.text);
        }
      });
      return result.text;
    } catch {
      // Fall through to Ollama
    }
  }

  // Ollama fallback
  let full = "";
  await callOllama(
    config.ollamaEndpoint,
    config.defaultModel,
    systemPrompt,
    input,
    (chunk, accumulated) => {
      full = accumulated;
      onToken?.(chunk, accumulated);
    }
  );
  return full;
}

// ── Invoke a specific brain agent ────────────────────────
async function invokeAgent(def, input, config, signal) {
  const backend = def.backend === "trit-trt" && config.tritTrt?.ok ? "trit-trt" : "ollama";
  const prompt = def.systemPrompt ? `${def.systemPrompt}\n\n${input}` : input;

  if (backend === "trit-trt") {
    try {
      const wsEndpoint = config.tritTrtEndpoint.replace(/^http/, "ws") + "/ws";
      const result = await callTritTRT(wsEndpoint, prompt, {
        rounds: 1, candidates: 2, max_tokens: 256,
      });
      return result.text;
    } catch {
      // Fall through
    }
  }

  return await callOllama(
    config.ollamaEndpoint,
    config.defaultModel,
    def.systemPrompt,
    input
  );
}
