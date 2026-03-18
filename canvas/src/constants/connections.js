import { M } from "../theme/mizu.js";

// ── Connection Types (ternary-typed synapses) ────────────────────────
export const CONN_TYPES = {
  EXCITATORY: { label: "+1 Excitatory", color: "#00D4AA", dash: "",    width: 2   },
  INHIBITORY: { label: "-1 Inhibitory", color: M.thesis,  dash: "8,4", width: 2   },
  MODULATORY: { label: "0 Modulatory",  color: M.synthesis, dash: "4,4", width: 1.5 },
};
