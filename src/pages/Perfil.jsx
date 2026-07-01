import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useMovies } from '../services/useMovies'
import { calcularConquistas } from '../services/achievements'
import ConquistaCard from '../components/ConquistaCard'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { doc, updateDoc } from 'firebase/firestore'

// ── Sistema de Nível ─────────────────────────────────────────
function calcNivel(assistidos, desbloqueadas, totalConquistas) {
  const pontos = assistidos * 1 + desbloqueadas * 10
  if (pontos >= 500) return { nome: 'Mestre',   cor: '#f59e0b', icone: 'ti-crown',    min: 500, max: null }
  if (pontos >= 200) return { nome: 'Crítico',  cor: '#a855f7', icone: 'ti-star',     min: 200, max: 500 }
  if (pontos >= 80)  return { nome: 'Cinéfilo', cor: '#4488cc', icone: 'ti-movie',    min: 80,  max: 200 }
  return                    { nome: 'Iniciante',cor: '#64748b', icone: 'ti-eye',      min: 0,   max: 80  }
}

function NivelBadge({ nivel, pontos }) {
  const pct = nivel.max ? Math.min(((pontos - nivel.min) / (nivel.max - nivel.min)) * 100, 100) : 100
  return (
    <div style={{
      background: 'var(--surface2)',
      borderRadius: 16,
      padding: '16px 18px',
      border: `1px solid ${nivel.cor}30`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            background: `${nivel.cor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <i className={`ti ${nivel.icone}`} style={{ fontSize: 15, color: nivel.cor }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: nivel.cor, letterSpacing: '-0.03em' }}>{nivel.nome}</span>
        </div>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text-3)',
          background: 'var(--surface)',
          padding: '4px 10px',
          borderRadius: 20,
        }}>{pontos} pts</span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: nivel.cor, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      {nivel.max && (
        <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 6, textAlign: 'right' }}>
          {pontos}/{nivel.max} para {nivel.nome === 'Iniciante' ? 'Cinéfilo' : nivel.nome === 'Cinéfilo' ? 'Crítico' : 'Mestre'}
        </div>
      )}
    </div>
  )
}

// ── Modal Escolher Filme Destaque ────────────────────────────
function ModalEscolherFilme({ filmes, onEscolher, onFechar }) {
  const [busca, setBusca] = useState('')
  const lista = filmes
    .filter(f => f.assistido && f.nota)
    .filter(f => !busca || f.titulo?.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 50)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,10,11,0.92)' }}
      onClick={onFechar}
    >
      <div
        style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', width: '100%', maxWidth: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Escolher Filme Destaque</h3>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 16 }}>
            <i className="ti ti-x" />
          </button>
        </div>
        <input
          className="input"
          placeholder="Buscar filme..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ marginBottom: 12 }}
          autoFocus
        />
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lista.map(f => (
            <div
              key={f.id}
              onClick={() => { onEscolher(f.id); onFechar() }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: 'var(--surface)', border: '0.5px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ width: 30, height: 42, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: 'var(--surface2)' }}>
                {f.poster && f.poster !== 'N/A'
                  ? <img src={f.poster} alt={f.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-movie" style={{ fontSize: 11, color: 'var(--text-4)' }} />
                    </div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.titulo}</div>
                <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 1 }}>{f.ano}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-rating)', flexShrink: 0 }}>★ {f.nota?.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Filme Destaque ────────────────────────────────────────────
function FilmeDestaque({ filmes, filmeDestaqueId, onEscolher }) {
  const destaque = useMemo(() => {
    if (!filmeDestaqueId) return null
    return filmes.find(f => f.id === filmeDestaqueId) || null
  }, [filmes, filmeDestaqueId])

  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Filme Destaque</span>
        <button
          onClick={onEscolher}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--accent)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}
        >
          <i className="ti ti-edit" style={{ fontSize: 10 }} /> escolher
        </button>
      </div>
      {destaque ? (
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 58, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--border)' }}>
            {destaque.poster && destaque.poster !== 'N/A'
              ? <img src={destaque.poster} alt={destaque.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-movie" style={{ fontSize: 14, color: 'var(--text-4)' }} />
                </div>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="ti ti-star-filled" style={{ fontSize: 9 }} />
              {destaque.favorito ? 'Favorito' : 'Melhor avaliado'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{destaque.titulo}</div>
            <div style={{ fontSize: 11, color: 'var(--accent-rating)', marginTop: 3, fontWeight: 600 }}>★ {destaque.nota?.toFixed(1)}</div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-4)', fontSize: 12 }}>
          Nenhum filme encontrado
        </div>
      )}
    </div>
  )
}

// ── Mapa de Calor ─────────────────────────────────────────────
function HeatMap({ filmes }) {
  const hoje = new Date()
  const umAnoAtras = new Date(hoje)
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)

  const contagemDias = useMemo(() => {
    const map = {}
    filmes.filter(f => f.assistido && f.dataAssistido).forEach(f => {
      const d = f.dataAssistido.slice(0, 10)
      if (new Date(d + 'T12:00:00') >= umAnoAtras) map[d] = (map[d] || 0) + 1
    })
    return map
  }, [filmes])

  const dias = useMemo(() => {
    const arr = []
    const d = new Date(umAnoAtras)
    // Começar sempre no domingo da semana
    while (d.getDay() !== 0) d.setDate(d.getDate() - 1)
    while (d <= hoje) { arr.push(new Date(d)); d.setDate(d.getDate() + 1) }
    return arr
  }, [])

  const semanas = useMemo(() => {
    const s = []
    for (let i = 0; i < dias.length; i += 7) s.push(dias.slice(i, i + 7))
    return s
  }, [dias])

  const mesesLabels = useMemo(() => {
    const seen = {}
    return semanas.map((sem, idx) => {
      const d = sem.find(d => d <= hoje && d >= umAnoAtras)
      if (!d) return null
      const mes = d.toLocaleDateString('pt-BR', { month: 'short' })
      if (!seen[mes]) { seen[mes] = true; return { idx, label: mes } }
      return null
    }).filter(Boolean)
  }, [semanas])

  const total      = Object.values(contagemDias).reduce((a, b) => a + b, 0)
  const diasAtivos = Object.keys(contagemDias).length

  const getCor = (qtd) => {
    if (!qtd) return 'var(--surface2)'
    if (qtd === 1) return '#166534'
    if (qtd === 2) return '#16a34a'
    if (qtd === 3) return '#22c55e'
    return '#4ade80'
  }

  // Todos os 7 dias com labels alternados
  const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const SZ = 13 // tamanho de cada quadradinho

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-calendar-stats" style={{ fontSize: 14, color: 'var(--accent)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Atividade de Visualização</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{total}</span> filmes em{' '}
          <span style={{ color: '#4488cc', fontWeight: 600 }}>{diasAtivos}</span> dias no último ano
        </span>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {/* Labels de meses */}
        <div style={{ display: 'flex', marginBottom: 6, marginLeft: 36 }}>
          {semanas.map((_, idx) => {
            const lbl = mesesLabels.find(m => m.idx === idx)
            return (
              <div key={idx} style={{ width: SZ + 2, fontSize: 9, color: 'var(--text-4)', whiteSpace: 'nowrap', userSelect: 'none' }}>
                {lbl?.label || ''}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
          {/* Labels dias da semana — todos os 7 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 6, flexShrink: 0 }}>
            {diasNomes.map((d, i) => (
              <div key={i} style={{
                height: SZ, fontSize: 9, color: 'var(--text-4)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                width: 28, userSelect: 'none',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid de quadradinhos */}
          <div style={{ display: 'flex', gap: 2 }}>
            {semanas.map((sem, si) => (
              <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sem.map((dia, di) => {
                  const key   = dia.toISOString().slice(0, 10)
                  const qtd   = contagemDias[key] || 0
                  const past  = dia <= hoje
                  const valid = dia >= umAnoAtras
                  return (
                    <div
                      key={di}
                      title={past && valid && qtd ? `${dia.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}: ${qtd} filme${qtd > 1 ? 's' : ''}` : undefined}
                      style={{
                        width: SZ, height: SZ, borderRadius: 'var(--radius-sm)',
                        background: (!past || !valid) ? 'transparent' : getCor(qtd),
                        opacity: (!past || !valid) ? 0 : 1,
                        cursor: qtd > 0 ? 'default' : 'default',
                        transition: 'transform 0.1s ease',
                      }}
                      onMouseEnter={e => { if (qtd > 0) e.currentTarget.style.transform = 'scale(1.3)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 9, color: 'var(--text-4)', marginRight: 2 }}>Menos</span>
          {['var(--surface2)', '#166534', '#16a34a', '#22c55e', '#4ade80'].map((cor, i) => (
            <div key={i} style={{ width: SZ, height: SZ, borderRadius: 'var(--radius-sm)', background: cor, border: '0.5px solid var(--border)' }} />
          ))}
          <span style={{ fontSize: 9, color: 'var(--text-4)', marginLeft: 2 }}>Mais</span>
        </div>
      </div>
    </div>
  )
}

// ── Modal QR ──────────────────────────────────────────────────
function ModalQR({ nickname, onFechar }) {
  const url = window.location.href
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=141415&color=c9a227&margin=10`
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,10,11,0.92)' }} onClick={onFechar}>
      <div className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', padding: '28px 32px', textAlign: 'center', maxWidth: 300, width: '100%' }}
        onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>QR Code do Perfil</h3>
        <p style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 16 }}>@{nickname}</p>
        <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 'var(--radius-lg)', margin: '0 auto', display: 'block' }} />
        <p style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 12, wordBreak: 'break-all' }}>{url}</p>
        <button onClick={onFechar} className="btn-gold" style={{ marginTop: 16 }}>Fechar</button>
      </div>
    </div>
  )
}

// ── Perfil Principal ──────────────────────────────────────────
export default function Perfil() {
  useMovies()
  const userProfile = useAppStore(s => s.userProfile)
  const filmes      = useAppStore(s => s.filmes)
  const user        = useAppStore(s => s.user)

  const [showQR, setShowQR]             = useState(false)
  const [resetMsg, setResetMsg]         = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [abaConquista, setAbaConquista] = useState('desbloqueadas')
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())
  const [showEscolherFilme, setShowEscolherFilme] = useState(false)

  // Carrega do perfil salvo — persiste entre sessões
  const [filmeDestaqueId, setFilmeDestaqueId] = useState(
    userProfile?.filmeDestaqueId || null
  )

  // Sincroniza se o userProfile carregar depois do mount
  const filmeDestaqueIdSalvo = userProfile?.filmeDestaqueId || null
  useMemo(() => {
    if (filmeDestaqueIdSalvo && !filmeDestaqueId) {
      setFilmeDestaqueId(filmeDestaqueIdSalvo)
    }
  }, [filmeDestaqueIdSalvo])

  // Salva no Firestore ao escolher
  const handleEscolherFilme = async (id) => {
    setFilmeDestaqueId(id)
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { filmeDestaqueId: id })
      } catch (e) {
        console.error('Erro ao salvar filme destaque:', e)
      }
    }
  }

  const conquistas    = useMemo(() => calcularConquistas(filmes), [filmes])
  const desbloqueadas = conquistas.filter(c => c.unlocked)
  const emProgresso   = conquistas.filter(c => !c.unlocked)

  const assistidos  = filmes.filter(f => f.assistido)
  const engajamento = filmes.length ? Math.round((assistidos.length / filmes.length) * 100) : 0

  const comNota   = assistidos.filter(f => f.nota)
  const mediaNota = comNota.length
    ? (comNota.reduce((a, f) => a + f.nota, 0) / comNota.length).toFixed(1)
    : '—'

  const anoAtual   = new Date().getFullYear()
  // Anos disponíveis para seleção
  const anosDisponiveis = useMemo(() => {
    const s = new Set(assistidos.filter(f => f.dataAssistido).map(f => parseInt(f.dataAssistido.slice(0, 4))))
    return [...s].sort((a, b) => b - a)
  }, [assistidos])

  const doAno      = assistidos.filter(f => f.dataAssistido?.startsWith(String(anoSelecionado)))
  const doAnoAnt   = assistidos.filter(f => f.dataAssistido?.startsWith(String(anoSelecionado - 1)))
  const diffAno    = doAno.length - doAnoAnt.length
  const comNotaAno = doAno.filter(f => f.nota)
  const mediaAno   = comNotaAno.length
    ? (comNotaAno.reduce((a, f) => a + f.nota, 0) / comNotaAno.length).toFixed(1)
    : '—'
  const genAno = {}
  doAno.flatMap(f => f.genero || []).forEach(g => { genAno[g] = (genAno[g] || 0) + 1 })
  const topGeneroAno  = Object.entries(genAno).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  const dirAno = {}
  doAno.flatMap(f => f.direcao || []).forEach(d => { if (d) dirAno[d] = (dirAno[d] || 0) + 1 })
  const topDiretorAno = Object.entries(dirAno).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const pontos = assistidos.length * 1 + desbloqueadas.length * 10
  const nivel  = calcNivel(assistidos.length, desbloqueadas.length, conquistas.length)

  const anoMembro = userProfile?.membroDesde?.toDate?.()?.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) || '—'
  const inicial   = userProfile?.nome?.charAt(0).toUpperCase() || '?'

  const handleRedefinirSenha = async () => {
    if (!user?.email) return
    setResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, user.email)
      setResetMsg('E-mail enviado!')
    } catch {
      setResetMsg('Erro ao enviar.')
    } finally {
      setResetLoading(false)
      setTimeout(() => setResetMsg(''), 4000)
    }
  }

  const handleCompartilhar = async () => {
    const url = window.location.href
    if (navigator.share) await navigator.share({ title: `Perfil de ${userProfile?.nome}`, url })
    else await navigator.clipboard.writeText(url)
  }

  const conquistasVisiveis = abaConquista === 'desbloqueadas' ? desbloqueadas : emProgresso

  return (
    <div style={{ padding: '20px 24px', background: 'var(--bg)', minHeight: '100vh', flex: 1 }}>

      {/* ── FAIXA SUPERIOR ── */}
      <div className="perfil-top" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'stretch', marginBottom: 10 }}>

        {/* Avatar + info */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 'var(--radius-full)', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: 'var(--btn-text)', border: '3px solid var(--surface2)',
            }}>{inicial}</div>
            <div style={{ position: 'absolute', bottom: 2, right: 2, width: 11, height: 11, borderRadius: 'var(--radius-full)', background: '#32d74b', border: '2px solid var(--bg)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.3px', whiteSpace: 'nowrap' }}>
              {userProfile?.nome || 'Usuário'}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 1 }}>@{userProfile?.nickname || ''}</p>
            <p style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
              <i className="ti ti-calendar" style={{ fontSize: 9 }} /> desde {anoMembro}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="perfil-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[
            { label: 'Cadastrados',  valor: filmes.length,          cor: 'var(--text-1)',       icone: 'ti-movie' },
            { label: 'Assistidos',   valor: assistidos.length,      cor: 'var(--text-1)',       icone: 'ti-eye' },
            { label: 'Engajamento',  valor: `${engajamento}%`,      cor: 'var(--accent)',       icone: 'ti-chart-pie' },
            { label: 'Nota Média',   valor: mediaNota,              cor: 'var(--accent-rating)',icone: 'ti-star' },
            { label: 'Conquistas',   valor: `${desbloqueadas.length}/${conquistas.length}`, cor: 'var(--text-1)', icone: 'ti-trophy' },
          ].map(s => (
            <div key={s.label} className="card" style={{
              padding: '18px 14px',
              textAlign: 'center',
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <i className={`ti ${s.icone}`} style={{ fontSize: 18, color: s.cor, opacity: 0.6, marginBottom: 8, display: 'block' }} />
              <div style={{ fontSize: 26, fontWeight: 800, color: s.cor, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.valor}</div>
              <div style={{ fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="card perfil-acoes" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center', minWidth: 160 }}>
          <button onClick={handleCompartilhar}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 700, color: 'var(--btn-text)', cursor: 'pointer', fontFamily: 'inherit' }}>
            <i className="ti ti-share" style={{ fontSize: 12 }} /> Compartilhar
          </button>
          <div className="perfil-acoes-btns" style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setShowQR(true)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>
              <i className="ti ti-qrcode" style={{ fontSize: 11 }} /> QR
            </button>
            <button onClick={handleRedefinirSenha} disabled={resetLoading} title="Redefinir Senha"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>
              <i className="ti ti-key" style={{ fontSize: 11 }} /> Senha
            </button>
          </div>
          {resetMsg && <p style={{ fontSize: 10, color: '#32d74b', textAlign: 'center', margin: 0 }}>{resetMsg}</p>}
        </div>
      </div>

      {/* ── GRID ASSIMÉTRICO ── */}
      <div className="perfil-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 10, marginBottom: 10 }}>

        {/* Coluna esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Nível */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Seu Nível</div>
            <NivelBadge nivel={nivel} pontos={pontos} />
            <p style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 8 }}>
              Pontos = filmes assistidos + conquistas × 10
            </p>
          </div>

          {/* Filme destaque */}
          <div className="card" style={{ padding: '16px 18px' }}>
          <FilmeDestaque
              filmes={filmes}
              filmeDestaqueId={filmeDestaqueId}
              onEscolher={() => setShowEscolherFilme(true)}
            />
          </div>

          {/* Ano em Filmes */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-calendar" style={{ fontSize: 14, color: 'var(--accent)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Seu Ano em Filmes</span>
              </div>
              <select
                value={anoSelecionado}
                onChange={e => setAnoSelecionado(parseInt(e.target.value))}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-1)',
                  padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
                }}
              >
                {anosDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="perfil-ano-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { valor: doAno.length,   cor: 'var(--accent)', label: `filmes em ${anoAtual}`, extra: diffAno !== 0 ? { cor: diffAno > 0 ? '#32d74b' : '#ff453a', texto: `${diffAno > 0 ? '↑' : '↓'} ${Math.abs(diffAno)} vs ${anoAtual-1}` } : null },
                { valor: mediaAno,       cor: 'var(--accent-rating)', label: 'nota média do ano' },
                { valor: topGeneroAno,   cor: 'var(--accent)', label: 'gênero favorito', small: true },
                { valor: topDiretorAno,  cor: '#2dd4bf',       label: 'diretor favorito', small: true },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', padding: '10px 12px', border: '0.5px solid var(--border)' }}>
                  <div style={{ fontSize: s.small ? 13 : 24, fontWeight: 700, color: s.cor, letterSpacing: s.small ? '-.2px' : '-.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.valor}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>{s.label}</div>
                  {s.extra && <div style={{ fontSize: 9, color: s.extra.cor, marginTop: 3 }}>{s.extra.texto}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conquistas */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-trophy" style={{ fontSize: 14, color: 'var(--accent)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Conquistas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600 }}>
                {desbloqueadas.length} de {conquistas.length}
              </span>
              <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 'var(--radius-md)', padding: 3, gap: 2 }}>
                {[
                  { id: 'desbloqueadas', label: `✓ ${desbloqueadas.length}` },
                  { id: 'progresso',     label: `🔒 ${emProgresso.length}` },
                ].map(a => (
                  <button key={a.id} onClick={() => setAbaConquista(a.id)}
                    style={{
                      padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11, cursor: 'pointer',
                      fontFamily: 'inherit', fontWeight: abaConquista === a.id ? 600 : 400,
                      background: abaConquista === a.id ? 'var(--surface)' : 'transparent',
                      color: abaConquista === a.id ? 'var(--text-1)' : 'var(--text-3)',
                      border: abaConquista === a.id ? '1px solid var(--border)' : 'none',
                    }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="conquistas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {conquistasVisiveis.map(c => <ConquistaCard key={c.id} conquista={c} />)}
          </div>
        </div>
      </div>

      {/* ── MAPA DE CALOR ── */}
      <HeatMap filmes={filmes} />

      {showQR && <ModalQR nickname={userProfile?.nickname || ''} onFechar={() => setShowQR(false)} />}
      {showEscolherFilme && (
        <ModalEscolherFilme
          filmes={filmes}
          onEscolher={handleEscolherFilme}
          onFechar={() => setShowEscolherFilme(false)}
        />
      )}
    </div>
  )
}