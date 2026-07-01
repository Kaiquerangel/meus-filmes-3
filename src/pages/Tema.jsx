import { useAppStore } from '../store/useAppStore'
import { useEffect } from 'react'

const TEMAS = [
  {
    id: 'gold',
    nome: 'Dark Neutro',
    desc: 'Cinza macOS com azul vivo. Confortável em qualquer luz.',
    bg: '#161618', surface: '#242426', surface2: '#2e2e30',
    border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
    accent: '#7c6af7', accentRating: '#e8a020',
    text1: '#f0ede8', text2: '#a8a49c', text3: '#68635c', text4: '#3e3a35',
    btnText: '#ffffff',
  },
  {
    id: 'dark-blue',
    nome: 'Dark Profundo',
    desc: 'Preto absoluto com azul. Máximo contraste.',
    bg: '#000000', surface: '#111112', surface2: '#1c1c1e',
    border: 'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.10)',
    accent: '#7c6af7', accentRating: '#e8a020',
    text1: '#f5f4f2', text2: '#a0a0a8', text3: '#606068', text4: '#38383f',
    btnText: '#ffffff',
  },
  {
    id: 'light',
    nome: 'Apple Light',
    desc: 'Off-white com azul. Limpo e fácil à luz do dia.',
    bg: '#f0f0f5', surface: '#ffffff', surface2: '#f0f0f5',
    border: 'rgba(0,0,0,0.08)', border2: 'rgba(0,0,0,0.14)',
    accent: '#007AFF', accentRating: '#a07400',
    text1: '#1c1c1e', text2: '#3a3a3c', text3: '#6e6e73', text4: '#aeaeb2',
    btnText: '#ffffff',
  },
  {
    id: 'cinema',
    nome: 'Cinema',
    desc: 'Preto profundo com âmbar. Dramático como uma sala de projeção.',
    bg: '#090909', surface: '#100f0d', surface2: '#191713',
    border: 'rgba(255,240,200,0.05)', border2: 'rgba(255,240,200,0.09)',
    accent: '#c8922a', accentRating: '#c8922a',
    text1: '#ede8df', text2: '#9a9082', text3: '#5a5248', text4: '#36302a',
    btnText: '#0a0808',
  },
  {
    id: 'tech',
    nome: 'Tech',
    desc: 'Azul-aço frio com índigo. Preciso, estilo Linear.',
    bg: '#0b0d12', surface: '#111520', surface2: '#181d2a',
    border: 'rgba(100,120,200,0.12)', border2: 'rgba(100,120,200,0.20)',
    accent: '#5b7df4', accentRating: '#e8a825',
    text1: '#e4e8f4', text2: '#8890aa', text3: '#545d78', text4: '#323850',
    btnText: '#ffffff',
  },
]

function PreviewFilme({ nome, nota, ano, t }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 8,
      overflow: 'hidden',
      flex: 1,
    }}>
      <div style={{
        height: 52,
        background: t.surface2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 18, opacity: 0.4 }}>🎬</span>
      </div>
      <div style={{ padding: '6px 8px' }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: t.text1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.01em',
        }}>
          {nome}
        </div>
        <div style={{ fontSize: 9, color: t.text3, marginTop: 1 }}>{ano}</div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          marginTop: 4,
          fontSize: 9,
          fontWeight: 700,
          padding: '2px 5px',
          borderRadius: 4,
          background: `${t.accentRating}18`,
          color: t.accentRating,
        }}>
          ★ {nota}
        </div>
      </div>
    </div>
  )
}

function TemaPreview({ tema: t, ativo, onSelect }) {
  const filmes = [
    { nome: 'Oppenheimer', nota: '9.0', ano: '2023' },
    { nome: 'Parasite',    nota: '8.8', ano: '2019' },
    { nome: 'Dune',        nota: '8.1', ano: '2021' },
  ]

  return (
    <div
      onClick={() => onSelect(t.id)}
      style={{
        background: t.bg,
        border: `2px solid ${ativo ? t.accent : t.border2}`,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: ativo ? `0 0 0 3px ${t.accent}28` : 'none',
        transform: ativo ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.2s var(--ease-out), box-shadow 0.2s, border-color 0.18s',
        outline: 'none',
      }}
    >
      {/* Header da preview */}
      <div style={{
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        padding: '9px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 20,
            height: 20,
            background: t.accent,
            borderRadius: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 10, color: t.btnText }}>🎬</span>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: t.text1,
            letterSpacing: '-0.02em',
          }}>
            Meus Filmes
          </span>
        </div>

        {/* Nav pills */}
        <div style={{ display: 'flex', gap: 2 }}>
          {['Início', 'Lista', 'Stats'].map((n, i) => (
            <div
              key={n}
              style={{
                padding: '2px 7px',
                borderRadius: 4,
                fontSize: 9,
                fontWeight: i === 1 ? 600 : 400,
                background: i === 1 ? t.accent : 'transparent',
                color: i === 1 ? t.btnText : t.text3,
              }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Cards de filmes */}
      <div style={{
        padding: 10,
        display: 'flex',
        gap: 7,
      }}>
        {filmes.map(f => (
          <PreviewFilme key={f.nome} nome={f.nome} nota={f.nota} ano={f.ano} t={t} />
        ))}
      </div>

      {/* Footer mini stats */}
      <div style={{
        background: t.surface,
        borderTop: `1px solid ${t.border}`,
        padding: '7px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {['248 filmes', '★ 8.1 média'].map(s => (
            <span key={s} style={{ fontSize: 9, color: t.text3 }}>{s}</span>
          ))}
        </div>
        <span style={{ fontSize: 9, color: t.accent, fontWeight: 600 }}>ver todos →</span>
      </div>

      {/* Info do tema */}
      <div style={{
        padding: '12px 14px',
        borderTop: `1px solid ${t.border}`,
        background: t.bg,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 5,
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: t.text1,
            letterSpacing: '-0.02em',
          }}>
            {t.nome}
          </span>
          {ativo && (
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 20,
              background: `${t.accent}20`,
              color: t.accent,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}>
              ✓ Ativo
            </span>
          )}
        </div>

        <p style={{
          fontSize: 11,
          color: t.text3,
          lineHeight: 1.5,
          margin: 0,
        }}>
          {t.desc}
        </p>

        {/* Paleta de cores */}
        <div style={{
          display: 'flex',
          gap: 5,
          marginTop: 10,
          alignItems: 'center',
        }}>
          {[t.bg, t.surface, t.surface2, t.accent, t.accentRating].map((cor, i) => (
            <div
              key={i}
              title={cor}
              style={{
                width: 13,
                height: 13,
                borderRadius: 3,
                background: cor,
                border: `1px solid ${t.border2}`,
                flexShrink: 0,
              }}
            />
          ))}
          <span style={{
            fontSize: 9,
            color: t.text4,
            marginLeft: 3,
            fontFamily: 'monospace',
          }}>
            {t.accent}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Tema() {
  const { tema, setTema } = useAppStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema)
  }, [tema])

  return (
    <div className="tema-container" style={{ padding: '28px 32px', maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--text-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          marginBottom: 6,
        }}>
          Aparência
        </p>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.03em',
          marginBottom: 6,
        }}>
          Tema
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Escolha o visual que mais combina com você. Salvo automaticamente.
        </p>
      </div>

      {/* Grid — 3 + 2 */}
      <div className="tema-grid-3" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 16,
      }}>
        {TEMAS.slice(0, 3).map(t => (
          <TemaPreview key={t.id} tema={t} ativo={tema === t.id} onSelect={setTema} />
        ))}
      </div>

      <div className="tema-grid-2" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        maxWidth: 'calc(66.66% + 8px)',
      }}>
        {TEMAS.slice(3).map(t => (
          <TemaPreview key={t.id} tema={t} ativo={tema === t.id} onSelect={setTema} />
        ))}
      </div>

      {/* Nota de rodapé */}
      <p style={{
        fontSize: 11,
        color: 'var(--text-4)',
        marginTop: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <i className="ti ti-info-circle" style={{ fontSize: 13 }} />
        O tema é aplicado imediatamente e salvo no seu navegador.
      </p>
    </div>
  )
}
