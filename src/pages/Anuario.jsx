import { useMemo, useState } from 'react'
import { useMovies } from '../services/useMovies'
import { useAppStore } from '../store/useAppStore'

// ── helpers ────────────────────────────────────────────────
function calcHoras(filmes) {
  return Math.round(
    filmes.filter(f => f.assistido && f.duracao)
      .reduce((acc, f) => acc + (parseInt(f.duracao) || 0), 0) / 60
  )
}

function filmesDoAno(filmes, ano) {
  return filmes.filter(f => f.assistido && f.dataAssistido?.startsWith(String(ano)))
}

function porSemana(filmes, ano) {
  const semanas = Array(52).fill(0)
  filmes.forEach(f => {
    if (!f.dataAssistido?.startsWith(String(ano))) return
    const d = new Date(f.dataAssistido)
    const inicio = new Date(`${ano}-01-01`)
    const semana = Math.floor((d - inicio) / (7 * 86400000))
    if (semana >= 0 && semana < 52) semanas[semana]++
  })
  return semanas
}

function porDiaDaSemana(filmes, ano) {
  const dias = Array(7).fill(0)
  filmes.forEach(f => {
    if (!f.dataAssistido?.startsWith(String(ano))) return
    const d = new Date(f.dataAssistido)
    dias[d.getDay()]++
  })
  // reordenar: seg(1)..dom(0)
  return [dias[1], dias[2], dias[3], dias[4], dias[5], dias[6], dias[0]]
}

function topItens(filmes, campo, limite = 10) {
  const freq = {}
  filmes.forEach(f => (f[campo] || []).forEach(v => { if (v) freq[v] = (freq[v] || 0) + 1 }))
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limite)
}

function topItensCampoStr(filmes, campo, limite = 10) {
  const freq = {}
  filmes.forEach(f => { const v = f[campo]; if (v) freq[v] = (freq[v] || 0) + 1 })
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limite)
}

function distNotas(filmes) {
  const dist = Array(10).fill(0)
  filmes.forEach(f => { if (f.nota) { const i = Math.min(Math.round(f.nota) - 1, 9); if (i >= 0) dist[i]++ } })
  return dist
}

function mediaNota(filmes) {
  const com = filmes.filter(f => f.nota)
  if (!com.length) return null
  return (com.reduce((a, f) => a + f.nota, 0) / com.length).toFixed(1)
}

// ── sub-componentes ────────────────────────────────────────
function SectionHeader({ title, tabs, activeTab, onTab }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 20 }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--text-4)' }}>{title}</span>
      {tabs && (
        <div style={{ display: 'flex', gap: 16 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => onTab(t)} style={{ fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === t ? 'var(--accent)' : 'var(--text-4)', fontWeight: activeTab === t ? 600 : 400 }}>
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PieChart({ pct, color }) {
  const r = 36, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg viewBox="0 0 100 100" width={120} height={120}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface2)" strokeWidth="14" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="14"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform="rotate(-90 50 50)" />
      <text x="50" y="55" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-1)">{pct}%</text>
    </svg>
  )
}

function BarChart({ data, color }) {
  const max = Math.max(...data, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', borderRadius: '2px 2px 0 0', background: v === max ? color : 'var(--surface2)', height: `${Math.round((v / max) * 100)}%`, minHeight: v > 0 ? 3 : 0, transition: 'height .3s' }} />
          <span style={{ fontSize: 9, color: 'var(--text-4)' }}>{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

function WeekBars({ data }) {
  const max = Math.max(...data, 1)
  const [hovIdx, setHovIdx] = useState(null)
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const semanaParaMes = (i) => MESES[Math.min(11, Math.floor(i / 4.33))]

  return (
    <div>
      {/* Legenda de intensidade */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'var(--text-4)' }}>Menos</span>
        {['var(--surface2)', 'rgba(124,106,247,0.25)', 'rgba(124,106,247,0.55)', 'var(--accent)'].map((bg, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: bg }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--text-4)' }}>Mais</span>
      </div>
      {/* Barras */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 2, height: 110, width: '100%' }}>
        {data.map((v, i) => {
          const bg = v === 0 ? 'var(--surface2)'
            : v >= max * 0.75 ? 'var(--accent)'
            : v >= max * 0.4  ? 'rgba(124,106,247,0.55)'
            : 'rgba(124,106,247,0.25)'
          return (
            <div key={i} onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)}
              style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', borderRadius: '2px 2px 0 0',
                background: hovIdx === i && v > 0 ? 'var(--accent-rating)' : bg,
                height: `${Math.round((v / max) * 100)}%`, minHeight: v > 0 ? 3 : 0,
                transition: 'height .3s, background .15s' }} />
              {hovIdx === i && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--surface3)', borderRadius: 'var(--radius-sm)', padding: '4px 8px',
                  fontSize: 10, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap',
                  pointerEvents: 'none', zIndex: 10, boxShadow: 'var(--shadow-sm)', lineHeight: 1.6 }}>
                  {semanaParaMes(i)}, semana {i + 1}<br />
                  <span style={{ color: 'var(--accent-rating)' }}>{v} {v === 1 ? 'filme' : 'filmes'}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GenreRow({ nome, valor, max, color }) {
  const pct = Math.round((valor / max) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 100, fontSize: 12, color: 'var(--text-2)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome}</div>
      <div style={{ flex: 1, height: 7, background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 'var(--radius-sm)' }} />
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-4)', width: 20, textAlign: 'right' }}>{valor}</span>
    </div>
  )
}

function CastAvatar({ nome, count }) {
  const iniciais = nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-full)', background: 'var(--surface2)', border: '0.5px solid var(--border)', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
        {iniciais}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-1)', fontWeight: 500, lineHeight: 1.3 }}>{nome}</div>
      <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 1 }}>{count} filmes</div>
    </div>
  )
}

function PosterThumb({ filme, height = null }) {
  return (
    <div style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface2)', border: '0.5px solid var(--border)', ...(height ? { height, width: 'auto' } : {}) }}>
      {filme?.poster && filme.poster !== 'N/A'
        ? <img src={filme.poster} alt={filme.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-movie" style={{ fontSize: 16, color: 'var(--border2)' }} />
          </div>
      }
    </div>
  )
}

function HighCard({ label, filme, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-4)', marginBottom: 8 }}>{label}</div>
      <div style={{ width: 100, margin: '0 auto' }}>
        <PosterThumb filme={filme} />
      </div>
      {filme && <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filme.titulo}</div>}
      {sub && <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── página principal ───────────────────────────────────────
export default function Anuario() {
  const { filmes } = useMovies()
  const userProfile = useAppStore(s => s.userProfile)
  const anoAtual = new Date().getFullYear()
  const [anoSel, setAnoSel] = useState(anoAtual)
  const [generoTab, setGeneroTab] = useState('Mais assistidos')
  const [castTab, setCastTab] = useState('Mais assistidos')
  const [dirTab, setDirTab] = useState('Mais assistidos')

  const anos = useMemo(() => {
    const set = new Set(filmes.filter(f => f.dataAssistido).map(f => parseInt(f.dataAssistido.slice(0, 4))))
    return [...set].sort((a, b) => b - a)
  }, [filmes])

  const assistidosAno = useMemo(() => filmesDoAno(filmes, anoSel), [filmes, anoSel])
  const semanas = useMemo(() => porSemana(filmes, anoSel), [filmes, anoSel])
  const diasSemana = useMemo(() => porDiaDaSemana(filmes, anoSel), [filmes, anoSel])
  const horas = useMemo(() => calcHoras(assistidosAno), [assistidosAno])
  const nota = useMemo(() => mediaNota(assistidosAno), [assistidosAno])
  const dist = useMemo(() => distNotas(assistidosAno), [assistidosAno])
  const mediaPoMes = assistidosAno.length ? (assistidosAno.length / 12).toFixed(1) : '0'
  const mediaPorSemana = assistidosAno.length ? (assistidosAno.length / 52).toFixed(1) : '0'

  const topGeneros = useMemo(() => topItens(assistidosAno, 'genero'), [assistidosAno])
  const topEstudios = useMemo(() => topItensCampoStr(assistidosAno, 'estudio'), [assistidosAno])
  const topOrigem = useMemo(() => topItensCampoStr(assistidosAno, 'origem'), [assistidosAno])

  const topAtores = useMemo(() => topItens(assistidosAno, 'atores', 15), [assistidosAno])
  const topDiretores = useMemo(() => topItens(assistidosAno, 'direcao', 10), [assistidosAno])

  const primeiroFilme = useMemo(() => [...assistidosAno].sort((a, b) => a.dataAssistido?.localeCompare(b.dataAssistido))[0], [assistidosAno])
  const ultimoFilme   = useMemo(() => [...assistidosAno].sort((a, b) => b.dataAssistido?.localeCompare(a.dataAssistido))[0], [assistidosAno])
  const maiorNota     = useMemo(() => [...assistidosAno].filter(f => f.nota).sort((a, b) => b.nota - a.nota)[0], [assistidosAno])
  const menorNota     = useMemo(() => [...assistidosAno].filter(f => f.nota).sort((a, b) => a.nota - b.nota)[0], [assistidosAno])
  const maisDuracao   = useMemo(() => [...assistidosAno].filter(f => f.duracao).sort((a, b) => parseInt(b.duracao) - parseInt(a.duracao))[0], [assistidosAno])
  const menosDuracao  = useMemo(() => [...assistidosAno].filter(f => f.duracao).sort((a, b) => parseInt(a.duracao) - parseInt(b.duracao))[0], [assistidosAno])
  const maisAntigo    = useMemo(() => [...assistidosAno].filter(f => f.ano).sort((a, b) => a.ano - b.ano)[0], [assistidosAno])
  const maisRecente   = useMemo(() => [...assistidosAno].filter(f => f.ano).sort((a, b) => b.ano - a.ano)[0], [assistidosAno])

  const pctAssistidos = filmes.length ? Math.round((filmes.filter(f => f.assistido).length / filmes.length) * 100) : 0
  const pctNacionais  = assistidosAno.length ? Math.round((assistidosAno.filter(f => f.origem === 'Nacional').length / assistidosAno.length) * 100) : 0

  // Média de nota por gênero — top 5 gêneros com pelo menos 1 nota
  const mediaNotaGenero = useMemo(() => {
    const genMap = {}
    assistidosAno.filter(f => f.nota).forEach(f => {
      (f.genero || []).forEach(g => {
        if (!g) return
        if (!genMap[g]) genMap[g] = { soma: 0, count: 0 }
        genMap[g].soma += f.nota
        genMap[g].count++
      })
    })
    return Object.entries(genMap)
      .filter(([, v]) => v.count >= 1)
      .map(([g, v]) => [g, (v.soma / v.count).toFixed(1)])
      .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
      .slice(0, 5)
  }, [assistidosAno])

  const maxGenero = topGeneros[0]?.[1] || 1
  const maxEstudio = topEstudios[0]?.[1] || 1
  const maxOrigem = topOrigem[0]?.[1] || 1
  const maxDia    = Math.max(...diasSemana, 1)
  const DOW_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

  if (!filmes.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
        <i className="ti ti-calendar-off" style={{ fontSize: 40, color: 'var(--border2)' }} />
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Nenhum filme registrado ainda.</p>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 60 }}>

      {/* ── HERO — full width ── */}
      <div className="anuario-hero" style={{ position: 'relative', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid var(--border)', padding: '40px 24px 32px' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 3, padding: '0 20px', opacity: 0.15, pointerEvents: 'none' }}>
          {semanas.map((v, i) => (
            <div key={i} style={{ flex: 1, borderRadius: '2px 2px 0 0', background: i % 4 === 0 ? 'var(--accent)' : i % 4 === 1 ? 'var(--green)' : i % 4 === 2 ? 'var(--yellow)' : 'var(--text-3)', height: `${Math.max(8, Math.round((v / Math.max(...semanas, 1)) * 200))}px` }} />
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 88, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-5px', lineHeight: 1, transition: 'font-size 0.2s' }}>{anoSel}</h1>
          <select value={anoSel} onChange={e => setAnoSel(parseInt(e.target.value))} style={{ fontSize: 13, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '5px 10px', color: 'var(--text-1)', cursor: 'pointer', fontFamily: 'inherit' }}>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 'var(--radius-full)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
            {userProfile?.nome?.charAt(0).toUpperCase() || 'K'}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>O ano de {userProfile?.nome || 'você'}{anoSel === anoAtual ? ' até agora' : ''}</span>
        </div>
      </div>

      {/* ── STATS ROW — full width ── */}
      <div className="anuario-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: '1px solid var(--border)' }}>
        {[
          { num: filmes.length,                      lbl: 'Filmes' },
          { num: assistidosAno.length,                lbl: 'Assistidos no ano' },
          { num: filmes.filter(f=>f.favorito).length, lbl: 'Favoritos' },
          { num: nota || '—',                         lbl: 'Nota média' },
          { num: horas ? `${horas}h` : '—',           lbl: 'Horas assistidas' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '20px 0', textAlign: 'center', borderRight: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-1px' }}>{s.num}</div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-4)', marginTop: 3 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── CONTEÚDO CENTRALIZADO ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

        {/* POR SEMANA */}
        <div style={{ padding: '32px 0 0' }}>
          <SectionHeader title="Por semana" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-4)', marginBottom: 6 }}>
            <span>Janeiro</span><span>Dezembro</span>
          </div>
          <WeekBars data={semanas} />
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            {[
              { num: assistidosAno.length, lbl: 'Filmes no ano' },
              { num: mediaPoMes,           lbl: 'Média por mês' },
              { num: mediaPorSemana,       lbl: 'Média por semana' },
            ].map((m, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-1px' }}>{m.num}</div>
                <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{m.lbl}</div>
              </div>
            ))}
            <div style={{ flex: '0 0 140px', paddingLeft: 20, borderLeft: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44 }}>
                {diasSemana.map((v, i) => {
                  const DOW_FULL = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo']
                  return (
                    <div key={i}
                      title={`${DOW_FULL[i]}: ${v} ${v === 1 ? 'filme' : 'filmes'}`}
                      style={{ flex: 1, borderRadius: '2px 2px 0 0', cursor: v > 0 ? 'default' : 'default',
                        background: v === Math.max(...diasSemana) ? 'var(--accent-rating)' : 'var(--surface2)',
                        height: `${Math.round((v / maxDia) * 100)}%`, minHeight: v > 0 ? 2 : 0 }} />
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                {DOW_LABELS.map((d, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text-4)' }}>{d}</div>)}
              </div>
            </div>
          </div>
        </div>

        {/* CONQUISTAS */}
        <div style={{ padding: '32px 0 0' }}>
          <SectionHeader title="Conquistas do ano" />
          <div className="anuario-conquistas-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 10 }}>Primeiro filme</div>
              <div style={{ width: 80, margin: '0 auto 8px' }}><PosterThumb filme={primeiroFilme} /></div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{primeiroFilme?.titulo || '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{primeiroFilme?.dataAssistido || ''}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 4 }}>Marcos do ano</div><div style={{ fontSize: 10, color: 'var(--text-4)', marginBottom: 8, opacity: 0.7 }}>50º, 100º, 150º e 200º filme assistido</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[50, 100, 150, 200].map(marco => {
                  const f = assistidosAno[marco - 1]
                  return (
                    <div key={marco} style={{ width: 52 }}>
                      <PosterThumb filme={f} />
                      {f && <div style={{ fontSize: 9, color: 'var(--accent-rating)', fontWeight: 700, marginTop: 4, textAlign: 'center' }}>{marco}º</div>}
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 10 }}>Último filme</div>
              <div style={{ width: 80, margin: '0 auto 8px' }}><PosterThumb filme={ultimoFilme} /></div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{ultimoFilme?.titulo || '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{ultimoFilme?.dataAssistido || ''}</div>
            </div>
          </div>
        </div>

        {/* GÊNEROS / ORIGEM / PLATAFORMA */}
        <div style={{ padding: '32px 0 0' }}>
          <SectionHeader title="Gêneros, origens e estúdios" tabs={['Mais assistidos']} activeTab={generoTab} onTab={setGeneroTab} />
          <div className="anuario-genero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-4)', marginBottom: 12 }}>Gênero</div>
              {topGeneros.map(([nome, val]) => <GenreRow key={nome} nome={nome} valor={val} max={maxGenero} color="var(--green)" />)}
              {!topGeneros.length && <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Sem dados</div>}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-4)', marginBottom: 12 }}>Origem</div>
              {topOrigem.map(([nome, val]) => <GenreRow key={nome} nome={nome} valor={val} max={maxOrigem} color="var(--accent)" />)}
              {!topOrigem.length && <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Sem dados</div>}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-4)', marginBottom: 12 }}>Estúdio</div>
              {topEstudios.map(([nome, val]) => <GenreRow key={nome} nome={nome} valor={val} max={maxEstudio} color="var(--yellow)" />)}
              {!topEstudios.length && <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Sem dados</div>}
            </div>
          </div>
        </div>

        {/* BREAKDOWN */}
        <div style={{ padding: '32px 0 0' }}>
          <SectionHeader title="Breakdown" />
          <div className="anuario-breakdown-grid" style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 24, flex: 1 }}>
              {[
                { label: 'Nacionais vs Internacionais', pct: pctNacionais,  legA: 'Nacionais',  legB: 'Internacionais', color: 'var(--green)' },
                { label: 'Assistidos vs Pendentes',     pct: pctAssistidos, legA: 'Assistidos', legB: 'Pendentes',       color: 'var(--accent)' },
              ].map(p => (
                <div key={p.label} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 'var(--radius-full)', background: p.color, display: 'inline-block' }} />{p.legA}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 'var(--radius-full)', background: 'var(--surface2)', border: '0.5px solid var(--border)', display: 'inline-block' }} />{p.legB}
                    </span>
                  </div>
                  <PieChart pct={p.pct} color={p.color} />
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-4)', marginTop: 6 }}>{p.label}</div>
                </div>
              ))}
            </div>
            {/* Média de nota por gênero — top 5 */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-4)', marginBottom: 14 }}>Média de nota por gênero</div>
              {mediaNotaGenero.length
                ? mediaNotaGenero.map(([genero, media], i) => (
                  <div key={genero} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 80, fontSize: 11, color: 'var(--text-2)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{genero}</div>
                    <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ width: `${(media / 10) * 100}%`, height: '100%', background: 'var(--accent-rating)', borderRadius: 100, transition: 'width .4s' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-rating)', width: 28, textAlign: 'right', flexShrink: 0 }}>{media}</span>
                  </div>
                ))
                : <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Sem dados de nota.</div>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-4)', marginBottom: 12 }}>Distribuição de notas</div>
              {/* Barras com label de nota e tooltip de contagem */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
                {dist.map((v, i) => {
                  const maxDist = Math.max(...dist, 1)
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                      {v > 0 && <span style={{ fontSize: 8, color: 'var(--text-4)', fontWeight: 600 }}>{v}</span>}
                      <div title={`Nota ${i + 1}: ${v} ${v === 1 ? 'filme' : 'filmes'}`} style={{ width: '100%', borderRadius: '3px 3px 0 0', background: v === Math.max(...dist) ? 'var(--accent-rating)' : v > 0 ? 'rgba(232,160,32,0.4)' : 'var(--surface2)', height: `${Math.round((v / maxDist) * 100)}%`, minHeight: v > 0 ? 4 : 0, transition: 'height .3s', cursor: v > 0 ? 'default' : 'default' }} />
                      <span style={{ fontSize: 9, color: 'var(--text-4)' }}>{i + 1}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ATORES */}
        <div style={{ padding: '32px 0 0' }}>
          <SectionHeader title="Artistas" tabs={['Mais assistidos']} activeTab={castTab} onTab={setCastTab} />
          {topAtores.length
            ? <div className="anuario-cast-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px 12px' }}>
                {topAtores.map(([nome, count]) => <CastAvatar key={nome} nome={nome} count={count} />)}
              </div>
            : <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Nenhum ator registrado nos filmes deste ano.</div>
          }
        </div>

        {/* DIRETORES */}
        <div style={{ padding: '32px 0 0' }}>
          <SectionHeader title="Direção" tabs={['Mais assistidos']} activeTab={dirTab} onTab={setDirTab} />
          {topDiretores.length
            ? <div className="anuario-cast-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px 12px' }}>
                {topDiretores.map(([nome, count]) => <CastAvatar key={nome} nome={nome} count={count} />)}
              </div>
            : <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Nenhum diretor registrado nos filmes deste ano.</div>
          }
        </div>

        {/* DESTAQUES E RECORDES */}
        <div style={{ padding: '32px 0 0' }}>
          <SectionHeader title="Destaques e recordes" />
          <div className="anuario-recordes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px 20px' }}>
            <HighCard label="Maior nota"         filme={maiorNota}    sub={maiorNota    ? `★ ${maiorNota.nota.toFixed(1)}`    : '—'} />
            <HighCard label="Menor nota"         filme={menorNota}    sub={menorNota    ? `★ ${menorNota.nota.toFixed(1)}`    : '—'} />
            <HighCard label="Mais recente"       filme={maisRecente}  sub={maisRecente  ? `${maisRecente.ano}`                : '—'} />
            <HighCard label="Mais antigo"        filme={maisAntigo}   sub={maisAntigo   ? `${maisAntigo.ano}`                 : '—'} />
            <HighCard label="Mais longo"         filme={maisDuracao}  sub={maisDuracao  ? `${maisDuracao.duracao} min`        : '—'} />
            <HighCard label="Mais curto"         filme={menosDuracao} sub={menosDuracao ? `${menosDuracao.duracao} min`       : '—'} />
            <HighCard label="Primeiro assistido" filme={primeiroFilme} sub={primeiroFilme?.dataAssistido || '—'} />
            <HighCard label="Último assistido"   filme={ultimoFilme}   sub={ultimoFilme?.dataAssistido   || '—'} />
          </div>
        </div>

        {/* GRID DE FILMES */}
        <div style={{ padding: '32px 0 0' }}>
          <SectionHeader title={`Filmes assistidos em ${anoSel}`} />
          {assistidosAno.length
            ? <div className="anuario-poster-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', gap: 5 }}>
                {assistidosAno.map(f => <PosterThumb key={f.id} filme={f} />)}
              </div>
            : <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Nenhum filme assistido em {anoSel}.</div>
          }
        </div>

      </div>{/* fim centralizado */}
    </div>
  )
}