import { M } from "../../theme/mizu.js";
import LogLine from "../shared/LogLine.jsx";

export default function LogTab({ log, logRef }) {
  return (
    <div ref={logRef} style={{ padding: 8, flex: 1 }}>
      {log.length === 0 ? (
        <div style={{ color: M.textDim, padding: 16, textAlign: "center", fontSize: 9 }}>
          No activity yet. Build a workflow and press RUN.
        </div>
      ) : (
        log.map((e, i) => <LogLine key={i} entry={e} />)
      )}
    </div>
  );
}
