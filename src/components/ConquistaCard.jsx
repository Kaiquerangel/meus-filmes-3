import { useState } from 'react'

export default function ConquistaCard({ conquista }) {
  const { nome, descricao, icone, target, progressoAtual, unlocked, detalhe } = conquista
  const pct     = Math.min((progressoAtual / target) * 100, 100)
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        backgroundImage: 'var(--surface-gradient)',
        border: `1px solid ${unlocked ? 'var(--accent-rating)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 10px 12px',
        opacity: unlocked ? 1 : 0.55,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 6,
        position: 'relative',
        cursor: 'default',
        transition:
          'transform 0.18s var(--ease-out), box-shadow 0.18s var(--ease-out), border-color 0.15s, opacity 0.15s',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov && unlocked
          ? '0 6px 20px rgba(201,162,39,0.2)'
          : hov
          ? 'var(--shadow-sm)'
          : 'none',
      }}
    >
      {/* Badge canto */}
      <div style={{
        position: 'absolute',
        top: 7,
        right: 7,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: unlocked ? 'linear-gradient(135deg, #f0c060 0%, var(--accent-rating) 100%)' : 'var(--surface2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s var(--ease-bounce)',
        transform: hov && unlocked ? 'scale(1.2)' : 'scale(1)',
      }}>
        <i
          className={`ti ${unlocked ? 'ti-check' : 'ti-lock'}`}
          style={{
            fontSize: 8,
            color: unlocked ? 'var(--btn-text)' : 'var(--text-4)',
          }}
        />
      </div>

      {/* Ícone */}
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 'var(--radius-lg)',
        background: unlocked ? 'linear-gradient(135deg, rgba(240,192,96,0.15) 0%, var(--accent-rating-dim) 100%)' : 'var(--surface2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.22s var(--ease-bounce)',
        transform: hov ? 'scale(1.12) rotate(-4deg)' : 'scale(1)',
      }}>
        <i
          className={`ti ${icone}`}
          style={{
            fontSize: 20,
            color: unlocked ? 'var(--accent-rating)' : 'var(--text-4)',
            transition: 'color 0.15s',
          }}
        />
      </div>

      {/* Nome */}
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: unlocked ? 'var(--text-1)' : 'var(--text-3)',
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
      }}>
        {nome}
      </span>

      {/* Status */}
      {unlocked ? (
        <span style={{
          fontSize: 10,
          color: 'var(--accent-rating)',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          fontWeight: 600,
        }}>
          <i className="ti ti-check" style={{ fontSize: 9 }} />
          Concluída
        </span>
      ) : (
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-3)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {progressoAtual} / {target}
        </span>
      )}

      {/* Descrição — aparece no hover com altura animada */}
      <div style={{
        maxHeight: hov ? 60 : 0,
        overflow: 'hidden',
        opacity: hov ? 1 : 0,
        transition: 'max-height 0.22s var(--ease-out), opacity 0.18s',
      }}>
        <p style={{
          fontSize: 9,
          color: 'var(--text-4)',
          lineHeight: 1.45,
          margin: 0,
          padding: '2px 0',
        }}>
          {descricao}
        </p>
        {detalhe && (
          <p style={{
            fontSize: 9,
            color: 'var(--accent-rating)',
            lineHeight: 1.4,
            margin: '3px 0 0',
            fontWeight: 600,
          }}>
            {detalhe}
          </p>
        )}
      </div>

      {/* Barra de progresso — só para não desbloqueadas */}
      {!unlocked && (
        <div style={{
          width: '100%',
          height: 3,
          background: 'var(--surface2)',
          borderRadius: 2,
          overflow: 'hidden',
          marginTop: 2,
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--accent-hover), var(--accent))',
            borderRadius: 2,
            opacity: 0.6,
            transition: 'width 0.4s var(--ease-out)',
          }} />
        </div>
      )}
    </div>
  )
}
