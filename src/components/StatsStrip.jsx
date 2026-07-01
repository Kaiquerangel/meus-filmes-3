export default function StatsStrip({ filmes }) {
  const assistidos = filmes.filter(f => f.assistido)
  const comNota    = assistidos.filter(f => f.nota)
  const mediaNota  = comNota.length
    ? (comNota.reduce((a, f) => a + f.nota, 0) / comNota.length).toFixed(1)
    : '—'

  const diretores = {}
  filmes.flatMap(f => f.direcao || []).forEach(d => {
    if (d) diretores[d] = (diretores[d] || 0) + 1
  })
  const topDiretor = Object.entries(diretores).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const pct = filmes.length
    ? Math.round((assistidos.length / filmes.length) * 100)
    : 0

  const items = [
    { label: 'filmes',     value: filmes.length,      accent: false },
    { label: 'assistidos', value: assistidos.length,   accent: false },
    { label: 'pendentes',  value: filmes.length - assistidos.length, accent: false },
    { label: 'nota média', value: `★ ${mediaNota}`,   accent: true  },
  ]

  return (
    <div className="stats-strip" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      padding: '0 24px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      height: 38,
    }}>
      {items.map((item, i) => (
        <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {i > 0 && (
            <span style={{
              fontSize: 11,
              color: 'var(--border2)',
              margin: '0 12px',
              userSelect: 'none',
            }}>
              ·
            </span>
          )}
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: item.accent ? 'var(--accent-rating)' : 'var(--text-2)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {item.value}
          </span>
          <span style={{
            fontSize: 11,
            color: 'var(--text-4)',
            marginLeft: 4,
            fontWeight: 400,
          }}>
            {item.label}
          </span>
        </span>
      ))}

      {/* Barra de progresso no extremo direito */}
      <div style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 80,
          height: 3,
          background: 'var(--surface2)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--accent)',
            borderRadius: 2,
            transition: 'width 0.5s var(--ease-out)',
          }} />
        </div>
        <span style={{
          fontSize: 11,
          color: 'var(--text-4)',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}
