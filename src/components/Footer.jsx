export default function Footer() {
  const ano = new Date().getFullYear()
  const stack = ['React', 'Vite', 'Firebase', 'TMDB', 'OMDb', 'YouTube']

  return (
    <footer className="kra-footer" style={{
      padding: '20px 0 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      /* border-top removido — linha indesejada antes do rodapé */
      marginTop: 'auto',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {stack.map((s, i) => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-4)', letterSpacing: '0.01em' }}>{s}</span>
            {i < stack.length - 1 && (
              <span style={{ fontSize: 11, color: 'var(--border2)' }}>·</span>
            )}
          </span>
        ))}
        <span style={{ fontSize: 11, color: 'var(--border2)' }}>·</span>
        <a
          href="https://github.com/Kaiquerangel"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11,
            color: 'var(--text-4)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
        >
          <i className="ti ti-brand-github" style={{ fontSize: 12 }} />
          GitHub
        </a>
      </div>

      <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
        © {ano}{' '}
        <strong style={{ color: 'var(--text-3)', fontWeight: 600 }}>Meus Filmes</strong>
        {' '}— feito por{' '}
        <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>Kaique Rangel</strong>
      </span>
    </footer>
  )
}
