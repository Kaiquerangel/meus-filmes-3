import { useState, useEffect } from 'react'

export default function HeroBanner({ filmes, onVerDetalhes }) {
  const favoritosAssistidos = filmes.filter(f => f.favorito && f.assistido)
  const lista = favoritosAssistidos.length > 0
    ? favoritosAssistidos
    : [...filmes]
        .filter(f => f.assistido && f.nota)
        .sort((a, b) => b.nota - a.nota)
        .slice(0, 10)

  const [idx, setIdx]         = useState(0)
  const [vis, setVis]         = useState(true)
  const [hovSeta, setHovSeta] = useState(null)
  const filme = lista[idx]

  useEffect(() => {
    if (lista.length <= 1) return
    const t = setInterval(() => trocar((idx + 1) % lista.length), 8000)
    return () => clearInterval(t)
  }, [lista.length, idx])

  const trocar = (novoIdx) => {
    setVis(false)
    setTimeout(() => { setIdx(novoIdx); setVis(true) }, 180)
  }

  const anterior = () => trocar((idx - 1 + lista.length) % lista.length)
  const proximo  = () => trocar((idx + 1) % lista.length)

  if (!filme) return null

  const hasPoster   = filme.poster   && filme.poster   !== 'N/A'
  const hasBackdrop = filme.backdrop && filme.backdrop !== 'N/A'

  const arrowStyle = (side, hov) => ({
    position: 'absolute',
    [side]: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: 'none',
    background: hov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'background 0.18s',
    fontSize: 20,
  })

  return (
    <div className="kra-hero" style={{
      position: 'relative',
      height: 480,        /* era 400 — ganhou 80px */
      overflow: 'hidden',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .kra-hero         { height: 520px !important; }
          .kra-hero-content { padding: 0 20px !important; }
          .kra-hero-inner   { flex-direction: column; align-items: flex-start; gap: 16px; max-width: 100% !important; }
          .kra-hero-poster  { width: 110px !important; height: 160px !important; }
          .kra-hero-title   { font-size: 24px !important; }
        }
      `}</style>

      {/* Fundo */}
      {hasBackdrop ? (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${filme.backdrop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          filter: 'brightness(0.38) saturate(0.75)',
          transition: 'opacity 0.3s',
        }} />
      ) : hasPoster ? (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${filme.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(16px) brightness(0.28) saturate(0.8)',
          transform: 'scale(1.06)',
        }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)' }} />
      )}

      {/* Gradiente lateral */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, var(--bg) 0%, color-mix(in srgb, var(--bg) 80%, transparent) 40%, color-mix(in srgb, var(--bg) 20%, transparent) 65%, transparent 100%)',
      }} />

      {/* Gradiente inferior */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, var(--bg) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 24%, transparent 52%)',
      }} />

      {/* Setas */}
      {lista.length > 1 && (
        <>
          <button
            onClick={anterior}
            onMouseEnter={() => setHovSeta('left')}
            onMouseLeave={() => setHovSeta(null)}
            style={arrowStyle('left', hovSeta === 'left')}
          >
            <i className="ti ti-chevron-left" />
          </button>
          <button
            onClick={proximo}
            onMouseEnter={() => setHovSeta('right')}
            onMouseLeave={() => setHovSeta(null)}
            style={arrowStyle('right', hovSeta === 'right')}
          >
            <i className="ti ti-chevron-right" />
          </button>
        </>
      )}

      {/* Conteúdo */}
      <div
        className="kra-hero-content"
        style={{
          position: 'absolute', inset: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '0 88px',
          opacity: vis ? 1 : 0,
          transition: 'opacity 0.18s',
        }}
      >
        <div
          className="kra-hero-inner"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 36,
            maxWidth: 820,
          }}
        >
          {/* Poster — maior */}
          {hasPoster && (
            <img
              className="kra-hero-poster"
              src={filme.poster}
              alt={filme.titulo}
              style={{
                width: 185,        /* era 155 */
                height: 268,       /* era 224 — mantém proporção 2:3 */
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
                flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
              }}
            />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Label */}
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <i className="ti ti-star-filled" style={{ fontSize: 10 }} />
              {filme.favorito ? 'Favorito' : 'Destaque'}
            </div>

            {/* Título */}
            <h2
              className="kra-hero-title"
              style={{
                fontSize: 42,      /* era 38 */
                fontWeight: 800,
                color: 'var(--text-1)',
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                marginBottom: 14,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {filme.titulo}
            </h2>

            {/* Meta */}
            <div style={{
              fontSize: 13,
              color: 'var(--text-3)',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}>
              {filme.ano && <span>{filme.ano}</span>}
              {filme.genero?.[0] && (
                <>
                  <span style={{ color: 'var(--border2)' }}>·</span>
                  <span>{filme.genero[0]}</span>
                </>
              )}
              {filme.direcao?.[0] && (
                <>
                  <span style={{ color: 'var(--border2)' }}>·</span>
                  <span>Dir. {filme.direcao[0]}</span>
                </>
              )}
              {filme.nota && (
                <>
                  <span style={{ color: 'var(--border2)' }}>·</span>
                  <span style={{
                    color: 'var(--accent-rating)',
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: '-0.02em',
                  }}>
                    ★ {filme.nota.toFixed(1)}
                  </span>
                </>
              )}
              {filme.duracao && (
                <>
                  <span style={{ color: 'var(--border2)' }}>·</span>
                  <span>{filme.duracao} min</span>
                </>
              )}
            </div>

            {/* Botão + dots */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => onVerDetalhes?.(filme)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 26px',
                  height: 44,
                  background: 'var(--accent)',
                  color: 'var(--btn-text)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 4px 20px rgba(124,106,247,0.4)',
                  transition: 'background 0.14s, box-shadow 0.14s, transform 0.14s var(--ease-bounce)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--accent-hover)'
                  e.currentTarget.style.transform  = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--accent)'
                  e.currentTarget.style.transform  = 'translateY(0)'
                }}
              >
                <i className="ti ti-eye" style={{ fontSize: 16 }} />
                Ver detalhes
              </button>

              {/* Dots de navegação */}
              {lista.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {lista.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => trocar(i)}
                      style={{
                        width: i === idx ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        background: i === idx
                          ? 'var(--accent)'
                          : 'rgba(255,255,255,0.22)',
                        transition: 'width 0.28s var(--ease-out), background 0.28s',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
