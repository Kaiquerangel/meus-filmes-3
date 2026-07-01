import { useMemo, useState } from 'react'
import { useMovies } from '../services/useMovies'
import { useAppStore } from '../store/useAppStore'
import { calcStreak } from '../utils'

/* ── Sub-componentes ───────────────────────────────────────── */

function SectionTitle({ children, action }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
      marginTop: 32,
    }}>
      <span style={{
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--text-2)',
        letterSpacing: '-0.01em',
      }}>
        {children}
      </span>
      {action && (
        <div style={{ marginLeft: 'auto' }}>{action}</div>
      )}
    </div>
  )
}

/* Stat Card — número grande com ícone, estilo Material You */
function StatCard({ label, valor, sub, accent, icone }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: '20px 20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      transition: 'transform 0.18s, box-shadow 0.18s',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {icone && (
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: accent ? 'rgba(232,160,32,0.12)' : 'rgba(124,106,247,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}>
          <i
            className={`ti ${icone}`}
            style={{
              fontSize: 16,
              color: accent ? 'var(--accent-rating)' : 'var(--accent)',
            }}
          />
        </div>
      )}
      <span style={{
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        color: accent ? 'var(--accent-rating)' : 'var(--text-1)',
        fontVariantNumeric: 'tabular-nums',
        marginBottom: 8,
      }}>
        {valor}
      </span>
      <span style={{
        fontSize: 12,
        color: 'var(--text-3)',
        letterSpacing: '0.01em',
        lineHeight: 1.3,
      }}>
        {label}
      </span>
      {sub && (
        <span style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 3 }}>
          {sub}
        </span>
      )}
    </div>
  )
}

/* Destaque Card — ícone + dado proeminente */
function DestaqueCard({ label, valor, sub, accent, icone }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: '18px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'transform 0.18s, box-shadow 0.18s',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {icone && (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: accent ? 'rgba(232,160,32,0.12)' : 'rgba(124,106,247,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <i
            className={`ti ${icone}`}
            style={{
              fontSize: 20,
              color: accent ? 'var(--accent-rating)' : 'var(--accent)',
            }}
          />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--text-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 5,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.02em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {valor}
        </div>
        {sub && (
          <div style={{
            fontSize: 11,
            color: 'var(--text-4)',
            marginTop: 3,
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

/* Ranking Row */
function RankingItem({ posicao, nome, valor, total }) {
  const pct = total ? Math.round((valor / total) * 100) : 0
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{
        fontSize: 11,
        color: 'var(--text-4)',
        width: 18,
        textAlign: 'right',
        flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {posicao}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          color: 'var(--text-1)',
          marginBottom: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
        }}>
          {nome}
        </div>
        <div style={{
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
            transition: 'width 0.4s var(--ease-out)',
          }} />
        </div>
      </div>
      <span style={{
        fontSize: 12,
        color: 'var(--text-3)',
        flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 600,
      }}>
        {valor}
      </span>
    </div>
  )
}

function RankingCard({ titulo, icone, items, total }) {
  const [expandido, setExpandido] = useState(false)
  const LIMITE    = 8
  const visiveis  = expandido ? items : items.slice(0, LIMITE)
  const temMais   = items.length > LIMITE

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: '20px 20px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          background: 'rgba(124,106,247,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <i className={`ti ${icone}`} style={{ fontSize: 15, color: 'var(--accent)' }} />
        </div>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.02em',
        }}>
          {titulo}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          color: 'var(--text-4)',
          background: 'var(--surface2)',
          padding: '2px 8px',
          borderRadius: 20,
        }}>
          {items.length}
        </span>
      </div>

      {items.length
        ? (
          <>
            {visiveis.map(([nome, val], i) => (
              <RankingItem
                key={nome}
                posicao={i + 1}
                nome={nome}
                valor={val}
                total={total}
              />
            ))}
            {temMais && (
              <button
                onClick={() => setExpandido(v => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 12,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--accent)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  padding: '7px 14px',
                  fontWeight: 500,
                  width: '100%',
                  justifyContent: 'center',
                  transition: 'background 0.14s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}
              >
                <i
                  className={`ti ${expandido ? 'ti-chevron-up' : 'ti-chevron-down'}`}
                  style={{ fontSize: 12 }}
                />
                {expandido
                  ? 'Ver menos'
                  : `Ver mais ${items.length - LIMITE} itens`
                }
              </button>
            )}
          </>
        )
        : (
          <p style={{ fontSize: 12, color: 'var(--text-4)', padding: '8px 0' }}>
            Nenhum dado ainda.
          </p>
        )
      }
    </div>
  )
}

/* ── Helpers ───────────────────────────────────────────────── */
const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function normalizar(str) {
  return str?.trim().replace(/\s+/g, ' ') || ''
}

function calcRanks(filmesRef) {
  const assistidos = filmesRef.filter(f => f.assistido)

  const generos = {}
  assistidos.flatMap(f => f.genero || [])
    .map(normalizar).filter(Boolean)
    .forEach(g => { generos[g] = (generos[g] || 0) + 1 })

  const atores = {}
  assistidos.forEach(f => {
    const vistos = new Set()
    ;(f.atores || []).map(normalizar).filter(Boolean).forEach(a => {
      if (!vistos.has(a)) { vistos.add(a); atores[a] = (atores[a] || 0) + 1 }
    })
  })

  const diretores = {}
  assistidos.forEach(f => {
    const vistos = new Set()
    ;(f.direcao || []).map(normalizar).filter(Boolean).forEach(d => {
      if (!vistos.has(d)) { vistos.add(d); diretores[d] = (diretores[d] || 0) + 1 }
    })
  })

  const anosLanc = {}
  assistidos.forEach(f => { if (f.ano) anosLanc[f.ano] = (anosLanc[f.ano] || 0) + 1 })

  const anosAss = {}
  assistidos.filter(f => f.dataAssistido).forEach(f => {
    const a = f.dataAssistido.slice(0, 4)
    anosAss[a] = (anosAss[a] || 0) + 1
  })

  const decadas = {}
  assistidos.forEach(f => {
    if (f.ano) {
      const dec = Math.floor(f.ano / 10) * 10
      decadas[dec] = (decadas[dec] || 0) + 1
    }
  })

  return {
    rankGeneros:      Object.entries(generos).sort((a, b) => b[1] - a[1]),
    rankArtistas:     Object.entries(atores).sort((a, b) => b[1] - a[1]).slice(0, 20),
    rankDiretores:    Object.entries(diretores).sort((a, b) => b[1] - a[1]).slice(0, 20),
    rankAnosLanc:     Object.entries(anosLanc).sort((a, b) => b[1] - a[1]).slice(0, 20),
    rankAnoAssistido: Object.entries(anosAss).sort((a, b) => b[1] - a[1]).slice(0, 20),
    rankDecadas:      Object.entries(decadas).sort((a, b) => b[1] - a[1]).map(([k, v]) => [`Anos ${k}`, v]),
    totalRef:         assistidos.length,
  }
}

/* ── Página principal ──────────────────────────────────────── */
export default function Stats() {
  useMovies()
  const filmes     = useAppStore(s => s.filmes)
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroAno, setFiltroAno] = useState('')

  const stats = useMemo(() => {
    const assistidos = filmes.filter(f => f.assistido)
    const comNota    = assistidos.filter(f => f.nota)

    const mediaNota = comNota.length
      ? (comNota.reduce((a, f) => a + f.nota, 0) / comNota.length).toFixed(1)
      : '—'

    let mediana = '—'
    if (comNota.length) {
      const notas = [...comNota].map(f => f.nota).sort((a, b) => a - b)
      const mid   = Math.floor(notas.length / 2)
      mediana = notas.length % 2 !== 0
        ? notas[mid].toFixed(1)
        : ((notas[mid - 1] + notas[mid]) / 2).toFixed(1)
    }

    const generos = {}
    assistidos.flatMap(f => f.genero || []).forEach(g => { generos[g] = (generos[g] || 0) + 1 })
    const generoFavorito = Object.entries(generos).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    const h30 = new Date(); h30.setDate(h30.getDate() - 30)
    const generosRecentes = {}
    assistidos
      .filter(f => f.dataAssistido && new Date(f.dataAssistido) >= h30)
      .flatMap(f => f.genero || [])
      .forEach(g => { generosRecentes[g] = (generosRecentes[g] || 0) + 1 })
    const generoMomento = Object.entries(generosRecentes).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    const atores = {}
    assistidos.flatMap(f => f.atores || []).forEach(a => { if (a) atores[a] = (atores[a] || 0) + 1 })
    const artistaFrequente = Object.entries(atores).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    const decadas = {}
    assistidos.forEach(f => {
      if (f.ano) { const dec = Math.floor(f.ano / 10) * 10; decadas[dec] = (decadas[dec] || 0) + 1 }
    })
    const topDecada     = Object.entries(decadas).sort((a, b) => b[1] - a[1])[0]
    const decadaLabel   = topDecada ? `Anos ${topDecada[0]}` : '—'

    const meses = {}
    assistidos.filter(f => f.dataAssistido).forEach(f => {
      const m = f.dataAssistido.slice(0, 7)
      meses[m] = (meses[m] || 0) + 1
    })
    const topMes = Object.entries(meses).sort((a, b) => b[1] - a[1])[0]

    const ultimos3 = Object.entries(meses).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3)
    const ritmoMensal = ultimos3.length
      ? Math.round(ultimos3.reduce((a, [, v]) => a + v, 0) / ultimos3.length)
      : 0

    const nacionais       = assistidos.filter(f => f.origem === 'Nacional').length
    const pctNacional     = assistidos.length ? Math.round((nacionais / assistidos.length) * 100) : 0
    const pctInternacional = assistidos.length ? 100 - pctNacional : 0

    const melhorFilme     = comNota.length ? [...comNota].sort((a, b) => b.nota - a.nota)[0] : null
    const piorFilme       = comNota.length ? [...comNota].sort((a, b) => a.nota - b.nota)[0] : null

    const ultimoAssistido = assistidos
      .filter(f => f.dataAssistido)
      .sort((a, b) => b.dataAssistido.localeCompare(a.dataAssistido))[0] || null
    const ultimoLabel = ultimoAssistido?.dataAssistido
      ? new Date(ultimoAssistido.dataAssistido + 'T12:00:00')
          .toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
      : null

    const streakAtual = calcStreak(filmes)

    const faixas = { otimos: 0, bons: 0, medianos: 0, ruins: 0 }
    comNota.forEach(f => {
      if (f.nota >= 9) faixas.otimos++
      else if (f.nota >= 7) faixas.bons++
      else if (f.nota >= 5) faixas.medianos++
      else faixas.ruins++
    })

    const anosSet = new Set(
      filmes.filter(f => f.dataAssistido).map(f => f.dataAssistido.slice(0, 4))
    )
    const anosDisponiveis = [...anosSet].sort((a, b) => b.localeCompare(a))

    return {
      total: filmes.length, assistidos: assistidos.length,
      pendentes: filmes.length - assistidos.length,
      mediaNota, mediana, nacionais, pctNacional, pctInternacional,
      topMes, faixas, generoFavorito, generoMomento, artistaFrequente,
      decadaLabel, ritmoMensal, streakAtual, melhorFilme, piorFilme,
      ultimoAssistido, ultimoLabel, anosDisponiveis,
    }
  }, [filmes])

  const ranksFiltrados = useMemo(() => {
    let base = filmes
    if (filtroMes || filtroAno) {
      base = filmes.filter(f => {
        if (!f.dataAssistido) return false
        const [ano, mes] = f.dataAssistido.slice(0, 7).split('-')
        if (filtroAno && ano !== filtroAno) return false
        if (filtroMes && mes !== filtroMes) return false
        return true
      })
    }
    return calcRanks(base)
  }, [filmes, filtroMes, filtroAno])

  const mesLabel = stats.topMes
    ? new Date(stats.topMes[0] + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '—'

  const filtrando   = filtroMes || filtroAno
  const filtroLabel = [
    filtroMes ? MESES[parseInt(filtroMes) - 1] : '',
    filtroAno || '',
  ].filter(Boolean).join(' de ')

  const selectStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 12,
    color: 'var(--text-2)',
    padding: '5px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.14s',
  }

  return (
    <div style={{
      padding: '32px 28px',
      background: 'var(--bg)',
      minHeight: '100vh',
      flex: 1,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 8,
          }}>
            Visão geral
          </p>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--text-1)',
            letterSpacing: '-0.04em',
            marginBottom: 6,
            lineHeight: 1.1,
          }}>
            Estatísticas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Visão geral da sua coleção
          </p>
        </div>

        {/* ── Coleção ── */}
        <SectionTitle>Coleção</SectionTitle>
        <div className="stats-grid-4" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 12,
        }}>
          <StatCard label="Total de filmes" valor={stats.total}      icone="ti-movie" />
          <StatCard label="Assistidos"      valor={stats.assistidos} icone="ti-eye" />
          <StatCard label="Pendentes"       valor={stats.pendentes}  icone="ti-clock" />
          <StatCard label="Nota média"      valor={stats.mediaNota}  icone="ti-star" accent />
        </div>
        <div className="stats-grid-4" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 40,
        }}>
          <StatCard label="Nota mediana"    valor={stats.mediana}                         icone="ti-math" accent />
          <StatCard label="% Nacional"      valor={`${stats.pctNacional}%`}               icone="ti-flag" />
          <StatCard label="% Internacional" valor={`${stats.pctInternacional}%`}          icone="ti-globe" />
          <StatCard
            label="Mês mais ativo"
            valor={stats.topMes?.[1] ? `${stats.topMes[1]} filmes` : '—'}
            sub={mesLabel}
            icone="ti-calendar-stats"
            accent
          />
        </div>

        {/* ── Destaques ── */}
        <SectionTitle>Destaques</SectionTitle>
        <div className="stats-grid-3" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 12,
        }}>
          <DestaqueCard label="Gênero favorito"   valor={stats.generoFavorito} icone="ti-heart" accent />
          <DestaqueCard label="Gênero do momento" valor={stats.generoMomento}  sub="últimos 30 dias" icone="ti-trending-up" accent />
          <DestaqueCard label="Artista frequente" valor={stats.artistaFrequente} icone="ti-user-star" />
        </div>
        <div className="stats-grid-3" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 12,
        }}>
          <DestaqueCard label="Década popular" valor={stats.decadaLabel} icone="ti-calendar-event" />
          <DestaqueCard
            label="Ritmo mensal"
            valor={stats.ritmoMensal ? `${stats.ritmoMensal} filmes/mês` : '—'}
            sub="média dos últimos 3 meses"
            icone="ti-activity"
            accent
          />
          <DestaqueCard
            label="Sequência atual"
            valor={stats.streakAtual ? `${stats.streakAtual} dias seguidos` : '0 dias'}
            icone="ti-flame"
            accent={stats.streakAtual > 0}
          />
        </div>
        <div className="stats-grid-3" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 40,
        }}>
          <DestaqueCard
            label="Melhor filme"
            valor={stats.melhorFilme?.titulo || '—'}
            sub={stats.melhorFilme ? `★ ${stats.melhorFilme.nota.toFixed(1)}` : null}
            icone="ti-trophy"
            accent
          />
          <DestaqueCard
            label="Pior filme"
            valor={stats.piorFilme?.titulo || '—'}
            sub={stats.piorFilme ? `★ ${stats.piorFilme.nota.toFixed(1)}` : null}
            icone="ti-thumb-down"
          />
          <DestaqueCard
            label="Último assistido"
            valor={stats.ultimoAssistido?.titulo || '—'}
            sub={stats.ultimoLabel}
            icone="ti-clock"
          />
        </div>

        {/* ── Distribuição de notas ── */}
        <SectionTitle>Distribuição de notas</SectionTitle>
        <div className="stats-grid-4" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 12,
        }}>
          {[
            { label: 'Ótimos (9–10)',  valor: stats.faixas.otimos,   accent: true  },
            { label: 'Bons (7–8)',     valor: stats.faixas.bons                    },
            { label: 'Medianos (5–6)', valor: stats.faixas.medianos               },
            { label: 'Ruins (0–4)',    valor: stats.faixas.ruins                  },
          ].map(s => (
            <StatCard key={s.label} label={s.label} valor={s.valor} accent={s.accent} />
          ))}
        </div>

        {/* Legenda faixas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 40,
          padding: '12px 16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          flexWrap: 'wrap',
        }}>
          <i className="ti ti-info-circle" style={{ fontSize: 13, color: 'var(--text-4)', flexShrink: 0 }} />
          {[
            { faixa: '9–10', desc: 'Excepcional',  cor: 'var(--accent-rating)' },
            { faixa: '7–8',  desc: 'Bom',          cor: 'var(--text-2)' },
            { faixa: '5–6',  desc: 'Ok',           cor: 'var(--text-3)' },
            { faixa: '0–4',  desc: 'Ruim',         cor: 'var(--red)' },
          ].map(item => (
            <div key={item.faixa} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: item.cor }}>
                ★ {item.faixa}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
                — {item.desc}
              </span>
            </div>
          ))}
        </div>

        {/* ── Rankings ── */}
        <SectionTitle
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {filtrando && (
                <span style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  fontWeight: 500,
                }}>
                  {filtroLabel}
                </span>
              )}
              <i className="ti ti-filter" style={{ fontSize: 12, color: 'var(--text-4)' }} />
              <select
                value={filtroMes}
                onChange={e => setFiltroMes(e.target.value)}
                style={selectStyle}
              >
                <option value="">Mês</option>
                {MESES.map((m, i) => (
                  <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                ))}
              </select>
              <select
                value={filtroAno}
                onChange={e => setFiltroAno(e.target.value)}
                style={selectStyle}
              >
                <option value="">Ano</option>
                {stats.anosDisponiveis.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {filtrando && (
                <button
                  onClick={() => { setFiltroMes(''); setFiltroAno('') }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 11,
                    color: 'var(--text-3)',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'color 0.14s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  <i className="ti ti-x" style={{ fontSize: 10 }} />
                  Limpar
                </button>
              )}
            </div>
          }
        >
          Rankings
        </SectionTitle>

        <div className="stats-grid-2" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}>
          <RankingCard titulo="Artistas"             icone="ti-users"    items={ranksFiltrados.rankArtistas}     total={ranksFiltrados.totalRef} />
          <RankingCard titulo="Direção"              icone="ti-video"    items={ranksFiltrados.rankDiretores}    total={ranksFiltrados.totalRef} />
          <RankingCard titulo="Gêneros"              icone="ti-tag"      items={ranksFiltrados.rankGeneros}      total={ranksFiltrados.totalRef} />
          <RankingCard titulo="Ano de Lançamento"    icone="ti-calendar" items={ranksFiltrados.rankAnosLanc}     total={ranksFiltrados.totalRef} />
          <RankingCard titulo="Assistido por Ano"    icone="ti-eye"      items={ranksFiltrados.rankAnoAssistido} total={ranksFiltrados.totalRef} />
          <RankingCard titulo="Décadas Favoritas"    icone="ti-history"  items={ranksFiltrados.rankDecadas}      total={ranksFiltrados.totalRef} />
        </div>

      </div>

    </div>
  )
}
