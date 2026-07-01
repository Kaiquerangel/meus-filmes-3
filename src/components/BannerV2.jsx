// Coloque este arquivo em: src/components/BannerV2.jsx (no projeto v2)
// URL da v3 — troque pela URL real do seu deploy
const URL_V3 = 'https://meus-filmes.web.app'

export default function BannerV2() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      background: 'linear-gradient(135deg, #7c6af7 0%, #5b47e8 100%)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      boxShadow: '0 -4px 24px rgba(124,106,247,0.35)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🎬</span>
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.02em',
          }}>
            Meus Filmes 3.0 está disponível!
          </p>
          <p style={{
            margin: 0,
            fontSize: 11,
            color: 'rgba(255,255,255,0.75)',
            marginTop: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            Nova interface, mais recursos e melhor desempenho.
          </p>
        </div>
      </div>

      <a
        href={URL_V3}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flexShrink: 0,
          padding: '8px 16px',
          background: '#fff',
          color: '#5b47e8',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          textDecoration: 'none',
          letterSpacing: '-0.01em',
          transition: 'opacity 0.14s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Experimentar →
      </a>
    </div>
  )
}
