import { useState, useRef, useEffect } from 'react'

// Menu de 3 pontinhos — abre dropdown com as ações
function MenuAcoes({ acoes, hovered }) {
  const [aberto, setAberto] = useState(false)
  const menuRef = useRef(null)

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto])

  // Fecha quando o card perde hover (e o menu não está aberto)
  useEffect(() => {
    if (!hovered && !aberto) return
    if (!hovered) setAberto(false)
  }, [hovered])

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        opacity: hovered || aberto ? 1 : 0,
        transform: hovered || aberto ? 'scale(1)' : 'scale(0.8)',
        transition: 'opacity 0.16s, transform 0.16s var(--ease-spring)',
      }}
    >
      {/* Botão ⋯ */}
      <button
        onClick={e => { e.stopPropagation(); setAberto(v => !v) }}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.68)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 700,
          transition: 'background 0.14s',
          letterSpacing: '0.05em',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,106,247,0.7)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.68)'}
        title="Ações"
      >
        <i className="ti ti-dots-vertical" style={{ fontSize: 14 }} />
      </button>

      {/* Dropdown */}
      {aberto && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '5px',
          boxShadow: 'var(--shadow-lg)',
          minWidth: 148,
          animation: 'fadeSlideDown 0.16s var(--ease-out) both',
          zIndex: 20,
        }}>
          {acoes.map((acao, i) => (
            <button
              key={acao.label}
              onClick={e => { e.stopPropagation(); setAberto(false); acao.onClick(e) }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                color: acao.danger ? 'var(--red)' : 'var(--text-2)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = acao.danger ? 'var(--red-dim)' : 'var(--surface2)'
                e.currentTarget.style.color = acao.danger ? 'var(--red)' : 'var(--text-1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = acao.danger ? 'var(--red)' : 'var(--text-2)'
              }}
            >
              <i className={`ti ${acao.icon}`} style={{ fontSize: 15, flexShrink: 0 }} />
              {acao.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MovieCard({ filme, onEdit, onDelete, onToggle, onFavorito, onVerDetalhes, onAddColecao }) {
  const nota = filme.nota?.toFixed(1)
  const [hovered, setHovered] = useState(false)

  const imagem = (filme.poster && filme.poster !== 'N/A' && filme.poster !== '')
    ? filme.poster
    : null

  const acoes = [
    {
      icon: 'ti-eye',
      label: 'Ver detalhes',
      onClick: e => { e.stopPropagation(); onVerDetalhes(filme) },
    },
    {
      icon: 'ti-bookmark-plus',
      label: 'Adicionar à coleção',
      onClick: e => { e.stopPropagation(); onAddColecao?.(filme) },
    },
    {
      icon: 'ti-edit',
      label: 'Editar',
      onClick: e => { e.stopPropagation(); onEdit(filme) },
    },
    {
      icon: 'ti-trash',
      label: 'Excluir',
      onClick: e => { e.stopPropagation(); onDelete(filme.id) },
      danger: true,
    },
  ]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onVerDetalhes(filme)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        transform: hovered ? 'translateY(-6px) scale(1.04)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? '0 20px 48px rgba(0,0,0,0.65), 0 0 0 1.5px rgba(124,106,247,0.3)'
          : '0 2px 8px rgba(0,0,0,0.25)',
        transition: 'transform 0.24s cubic-bezier(0.16,1,0.3,1), box-shadow 0.24s',
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* Container interno — clip visual */}
      <div style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--surface)',
      }}>

        {/* ── Área do poster 2:3 ── */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2/3',
          background: 'var(--surface2)',
          overflow: 'hidden',
        }}>

          {/* Imagem */}
          {imagem ? (
            <img
              src={imagem}
              alt={filme.titulo}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(160deg, var(--surface2) 0%, var(--surface3) 100%)',
            }}>
              <i className="ti ti-movie" style={{ fontSize: 32, color: 'var(--border2)' }} />
              <span style={{ fontSize: 10, color: 'var(--text-4)', textAlign: 'center', padding: '0 12px', lineHeight: 1.4 }}>
                {filme.titulo}
              </span>
            </div>
          )}

          {/* Gradiente bottom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 40%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          {/* Borda luminosa no hover */}
          {hovered && (
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: 'inherit',
              boxShadow: 'inset 0 0 0 1.5px rgba(124,106,247,0.55)',
              pointerEvents: 'none',
              zIndex: 4,
            }} />
          )}

          {/* ── Badge status — ícone discreto, sem bolinha ──
              Só o ícone, pequeno, no canto inferior esquerdo
              Aparece suavemente no hover */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            zIndex: 3,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(3px)',
            transition: 'opacity 0.18s, transform 0.18s var(--ease-out)',
          }}>
            <i
              className={`ti ${filme.assistido ? 'ti-check' : 'ti-clock'}`}
              style={{
                fontSize: 13,
                color: filme.assistido
                  ? 'rgba(52,209,122,0.9)'   /* verde discreto */
                  : 'rgba(245,200,66,0.8)',   /* amarelo discreto */
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
              }}
            />
          </div>

          {/* ── Badge nota — sempre visível ── */}
          {nota && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              zIndex: 3,
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--accent-rating)',
              letterSpacing: '-0.01em',
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))',
            }}>
              ★ {nota}
            </div>
          )}

          {/* ── Menu ⋯ — canto superior direito ── */}
          <MenuAcoes acoes={acoes} hovered={hovered} />

        </div>

        {/* ── Info abaixo do poster ── */}
        <div style={{ padding: '8px 10px 10px' }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: 'var(--text-1)',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            letterSpacing: '-0.01em', lineHeight: 1.3,
          }}>
            {filme.titulo}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>
            {filme.ano}{filme.genero?.[0] ? ` · ${filme.genero[0]}` : ''}
          </div>
        </div>

      </div>
    </div>
  )
}
