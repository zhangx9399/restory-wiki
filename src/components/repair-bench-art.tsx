export function RepairBenchArt() {
  return (
    <div
      className="repair-art"
      role="img"
      aria-label="An original illustration of a cozy electronics repair bench with a lamp, circuit board, and hand tools"
    >
      <span className="art-glow" aria-hidden="true" />
      <span className="art-lamp" aria-hidden="true">
        <span className="lamp-shade" />
        <span className="lamp-arm" />
        <span className="lamp-base" />
      </span>
      <span className="art-board" aria-hidden="true">
        <span className="board-chip" />
        <span className="board-trace board-trace-one" />
        <span className="board-trace board-trace-two" />
        <span className="board-node board-node-one" />
        <span className="board-node board-node-two" />
      </span>
      <span className="art-tool art-tool-driver" aria-hidden="true" />
      <span className="art-tool art-tool-pliers" aria-hidden="true" />
      <span className="art-bench" aria-hidden="true" />
    </div>
  );
}
