// ── Ollama Local Inference API ────────────────────────────────────────

export async function callOllama(endpoint, model, systemPrompt, userMessage, onChunk) {
  const url = `${endpoint}/api/generate`;
  const body = JSON.stringify({
    model,
    system: systemPrompt,
    prompt: userMessage,
    stream: true,
  });
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (e) {
    throw new Error(
      `Cannot reach Ollama at ${endpoint}. Is it running? (${e.message})`
    );
  }
  if (!response.ok)
    throw new Error(`Ollama HTTP ${response.status}: ${await response.text()}`);
  const reader = response.body.getReader();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of new TextDecoder()
      .decode(value)
      .split("\n")
      .filter(Boolean)) {
      try {
        const p = JSON.parse(line);
        if (p.response) {
          full += p.response;
          if (onChunk) onChunk(p.response, full);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }
  return full;
}

export async function pingOllama(endpoint) {
  try {
    const r = await fetch(`${endpoint}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return { ok: false, models: [] };
    const d = await r.json();
    return { ok: true, models: (d.models || []).map((m) => m.name) };
  } catch {
    return { ok: false, models: [] };
  }
}
