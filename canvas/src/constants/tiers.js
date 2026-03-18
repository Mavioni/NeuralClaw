import { M } from "../theme/mizu.js";

// ── Tier Groups ──────────────────────────────────────────────────────
export const TIERS = [
  { id: "BRAINSTEM",   label: "Brainstem",     color: M.neural,    agents: ["RAS", "LC"] },
  { id: "THALAMUS",    label: "Thalamus",      color: M.waterLt,   agents: ["THL"] },
  { id: "CORTEX",      label: "Cortex",        color: M.thesis,    agents: ["PFC", "MOTOR", "SENSORY", "BROCA", "WERNICKE"] },
  { id: "LIMBIC",      label: "Limbic",        color: M.synthesis,  agents: ["HIPPO", "AMYGDALA", "ACC"] },
  { id: "BASAL",       label: "Basal Ganglia", color: "#E67E22",   agents: ["STRIATUM", "VTA"] },
  { id: "CEREBELLUM",  label: "Cerebellum",    color: "#27AE60",   agents: ["CBL"] },
  { id: "OUTPUT",      label: "Output",        color: M.success,   agents: ["OUT"] },
];
