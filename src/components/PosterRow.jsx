import { useRef, useState } from 'react'

function PosterCard({ filme, idx, w, ph, onVerDetalhes }) {
  const [hovered, setHovered] = useState(false)

  return (
    /*
      Mesma estrutura de dois níveis do MovieCard:
      [div externa] — transform + zIndex + boxShadow, SEM overflow:hidden
      [div interna] — border-radius + overflow:hidden (clip visual)
    */
    <div
      onClick={() => onVerDetalhes?.(filme)}
      style={{
        width: w,
        flexShrink: 0,
        cursor: 'pointer',
        animation: 'fadeSlideIn 0.35s var(--ease-out) both',
        animationDelay: `${Math.min(idx * 0.035, 0.28)}s`,
      }}
    >
      {/* Container do poster — dois níveis */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: w,
          height: ph,
          position: 'relative',
          /* Externo: transform livre, sem overflow:hidden */
          transform: hovered ? 'translateY(-6px) scale(1.04)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? '0 16px 40px rgba(0,0,0,0.65), 0 0 0 1.5px rgba(124,106,247,0.3)'
            : 'none',
          transition: 'transform 0.24s var(--ease-out), box-shadow 0.24s var(--ease-out)',
          zIndex: hovered ? 10 : 1,
          borderRadius: 'var(--radius-poster)',
        }}
      >
        {/* Interno: clip visual */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: 'var(--radius-poster)',
          overflow: 'hidden',
          background: 'var(--surface2)',
          position: 'relative',
        }}>
          {filme.poster && filme.poster !== 'N/A'
            ? (
              <img
                src={filme.poster}
                alt={filme.titulo}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  transition: 'transform 0.4s var(--ease-out)',
                  transform: hovered ? 'scale(1.06)' : 'scale(1)',
                }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="ti ti-movie" style={{ fontSize: 28, color: 'var(--border2)' }} />
              </div>
            )
          }

          {/* Gradiente inferior — aparece no hover */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.22s',
            pointerEvents: 'none',
          }} />

          {/* Borda luminosa interna no hover */}
          {hovered && (
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: 'inherit',
              boxShadow: 'inset 0 0 0 1.5px rgba(124,106,247,0.6), inset 0 1px 0 rgba(255,255,255,0.18)',
              pointerEvents: 'none',
              zIndex: 3,
            }} />
          )}

          {/* Badge nota — sempre visível */}
          {filme.nota && (
            <span style={{
              position: 'absolute', top: 6, right: 6,
              fontSize: 9, fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0,0,0,0.72)',
              color: 'var(--accent-rating)',
              backdropFilter: 'blur(4px)',
              letterSpacing: '0.01em',
              fontVariantNumeric: 'tabular-nums',
              zIndex: 2,
            }}>
              ★ {filme.nota.toFixed(1)}
            </span>
          )}

          {/* Título no hover */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '8px 9px 10px',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(5px)',
            transition: 'opacity 0.22s, transform 0.22s',
            pointerEvents: 'none',
            zIndex: 2,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: '#fff',
              lineHeight: 1.3, overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              letterSpacing: '-0.01em',
            }}>
              {filme.titulo}
            </div>
            {filme.ano && (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {filme.ano}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info abaixo */}
      <div style={{ marginTop: 8, padding: '0 1px', height: 46 }}>
        <div style={{
          fontSize: 11, fontWeight: 500, color: 'var(--text-2)',
          lineHeight: 1.3, overflow: 'hidden',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          letterSpacing: '-0.01em',
        }}>
          {filme.titulo}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>
          {filme.ano}{filme.genero?.[0] ? ` · ${filme.genero[0]}` : ''}
        </div>
      </div>
    </div>
  )
}

export default function PosterRow({ titulo, icone, filmes, tamanho = 'md', subtitulo, onVerDetalhes, onAtualizar }) {
  if (!filmes?.length) return null

  const rowRef = useRef(null)
  const [girando, setGirando] = useState(false)

  const handleAtualizar = () => {
    if (!onAtualizar || girando) return
    setGirando(true)
    onAtualizar()
    setTimeout(() => setGirando(false), 500)
  }

  const w  = tamanho === 'lg' ? 156 : 130
  const ph = tamanho === 'lg' ? 224 : 186

  return (
    <div className="kra-posterrow" style={{ padding: '0 32px', marginBottom: 28 }}>

      {/* Header */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <i className={`ti ${icone}`} style={{ fontSize: 13, color: 'var(--accent)', flexShrink: 0 }} />
            <h3 style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.09em', margin: 0,
            }}>
              {titulo}
            </h3>
          </div>
          {subtitulo && (
            <p style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 3, paddingLeft: 20, letterSpacing: '0.01em' }}>
              {subtitulo}
            </p>
          )}
        </div>

        {/* Botão atualizar — só aparece se onAtualizar for passado */}
        {onAtualizar && (
          <button
            onClick={handleAtualizar}
            title="Ver outros filmes"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-4)',
              fontSize: 11,
              fontFamily: 'inherit',
              padding: '2px 4px',
              borderRadius: 'var(--radius-md)',
              transition: 'color 0.14s',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
          >
            <i
              className="ti ti-refresh"
              style={{
                fontSize: 13,
                display: 'block',
                transition: 'transform 0.5s var(--ease-out)',
                transform: girando ? 'rotate(360deg)' : 'rotate(0deg)',
              }}
            />
            Atualizar
          </button>
        )}
      </div>

      {/* Scroll row — padding vertical para o hover não ser cortado */}
      <div
        ref={rowRef}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          overflowY: 'visible',      /* essencial: não corta o scale vertical */
          paddingBottom: 16,
          paddingTop: 8,             /* espaço para o translateY(-6px) não ser cortado */
          marginTop: -8,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {filmes.map((filme, idx) => (
          <PosterCard
            key={filme.id}
            filme={filme}
            idx={idx}
            w={w}
            ph={ph}
            onVerDetalhes={onVerDetalhes}
          />
        ))}
      </div>
    </div>
  )
}