import { M } from "../theme/mizu.js";

export const uid = () => Math.random().toString(36).slice(2, 9);

export const tritColor = (v) =>
  v === 1 ? M.thesis : v === -1 ? M.antithesis : M.synthesis;

export const tritSym = (v) => (v === 1 ? "▲" : v === -1 ? "▼" : "◆");

export const tritLabel = (v) =>
  v === 1 ? "PERMIT" : v === -1 ? "RESTRICT" : "EVALUATE";

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
