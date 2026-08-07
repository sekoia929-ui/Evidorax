export default function Logo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: '#2DD4A8', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#08110E" />
        <rect x="14" y="3" width="7" height="11" rx="1.5" fill="#08110E" opacity="0.55" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#08110E" opacity="0.55" />
        <rect x="14" y="18" width="7" height="3" rx="1.5" fill="#08110E" />
      </svg>
    </div>
  )
}
