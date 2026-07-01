// Coloque este arquivo em: src/components/BotaoVersaoAnterior.jsx (no projeto v3)
// URL da v2 — troque pela URL real do seu deploy
const URL_V2 = 'https://kra-filmes.netlify.app'

export default function BotaoVersaoAnterior() {
  return (
    <a
      href={URL_V2}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir Meus Filmes 2.0"
      style={{
        position: 'fixed',
        bottom: 32,
        left: 28,
        zIndex: 49,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 12px',
        height: 36,
        background: 'var(--surface2)',
        color: 'var(--text-3)',
        borderRadius: 'var(--radius-pill)',
        fontSize: 11,
        fontWeight: 500,
        textDecoration: 'none',
        boxShadow: 'var(--shadow)',
        transition: 'color 0.14s, background 0.14s, transform 0.14s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--text-1)'
        e.currentTarget.style.background = 'var(--surface3)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-3)'
        e.currentTarget.style.background = 'var(--surface2)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <i className="ti ti-history" style={{ fontSize: 13 }} />
      v2.0
    </a>
  )
}
