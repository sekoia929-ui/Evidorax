export default function CitationFlowBackground() {
  const nodes = [
    { x: 470, y: 120 }, { x: 560, y: 90 }, { x: 610, y: 190 },
    { x: 520, y: 250 }, { x: 600, y: 320 }, { x: 480, y: 380 },
    { x: 570, y: 440 }, { x: 640, y: 260 }
  ]

  const edges = [[0,1],[1,2],[0,3],[2,4],[3,5],[4,6],[3,4],[1,7],[7,4]]

  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}
    >
      <svg width="100%" height="100%" viewBox="0 0 900 560" fill="none" style={{ overflow: 'visible', opacity: 0.55 }}>

        {/* Source document */}
        <rect x="60" y="80" width="150" height="200" rx="6" stroke="#5B6470" strokeWidth="1.5" opacity="0.5" />
        {[0,1,2,3,4,5,6].map(i => (
          <line key={i} x1="78" y1={110 + i * 24} x2={i % 2 === 0 ? 190 : 160} y2={110 + i * 24} stroke="#5B6470" strokeWidth="1.5" opacity="0.35" />
        ))}

        {/* Lines from document to citation nodes */}
        <path d="M210 140 C 320 140, 350 130, 470 120" stroke="#2DD4A8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
        </path>
        <path d="M210 220 C 320 220, 400 260, 520 250" stroke="#2DD4A8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.6s" repeatCount="indefinite" />
        </path>

        {/* Citation graph — edges */}
        {edges.map(([a, b], i) => {
          const n1 = nodes[a], n2 = nodes[b]
          return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="#5B6470" strokeWidth="1" opacity="0.3" />
        })}

        {/* Citation graph — nodes */}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={i % 3 === 0 ? 5 : 3.5} fill="#2DD4A8" opacity={i % 3 === 0 ? 0.85 : 0.4}>
            <animate attributeName="opacity" values={`${i % 3 === 0 ? 0.85 : 0.4};${i % 3 === 0 ? 0.4 : 0.7};${i % 3 === 0 ? 0.85 : 0.4}`} dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Lines from graph into structured table */}
        <path d="M645 260 C 700 260, 700 200, 740 200" stroke="#2DD4A8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M645 260 C 700 260, 700 320, 740 320" stroke="#2DD4A8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.7s" repeatCount="indefinite" />
        </path>

        {/* Structured output table */}
        <rect x="740" y="160" width="140" height="200" rx="6" stroke="#2DD4A8" strokeWidth="1.5" opacity="0.5" />
        {[0,1,2,3,4,5].map(i => (
          <line key={i} x1="752" y1={190 + i * 26} x2="868" y2={190 + i * 26} stroke="#2DD4A8" strokeWidth="1" opacity="0.3" />
        ))}
        <line x1="800" y1="160" x2="800" y2="360" stroke="#2DD4A8" strokeWidth="1" opacity="0.25" />
      </svg>
    </div>
  )
}
