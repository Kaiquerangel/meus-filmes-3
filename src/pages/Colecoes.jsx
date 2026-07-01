import { useState, useMemo, useRef, useCallback } from 'react'
import { useColecoes } from '../services/useColecoes'
import { useAppStore } from '../store/useAppStore'
import ModalDetalhes from '../components/ModalDetalhes'

// ── Interior da coleção ───────────────────────────────────────
function ColecaoDetalhe({ colecao, filmes, onVoltar, onRemoverFilme }) {
  const [filtro, setFiltro]           = useState('todos')
  const [sort, setSort]               = useState('adicionado-desc')
  const [verDetalhes, setVerDetalhes] = useState(null)

  const filmesColecao = useMemo(() => {
    const ids = colecao.filmes || colecao.filmeIds || []
    let lista = ids
      .map((id, idx) => {
        const f = filmes.find(f => f.id === id)
        return f ? { ...f, _ordemColecao: idx } : null
      })
      .filter(Boolean)

    if (filtro === 'sim') lista = lista.filter(f => f.assistido)
    if (filtro === 'nao') lista = lista.filter(f => !f.assistido)

    const [by, dir] = sort.split('-')
    lista = [...lista].sort((a, b) => {
      if (by === 'adicionado') {
        return dir === 'asc' ? a._ordemColecao - b._ordemColecao : b._ordemColecao - a._ordemColecao
      }
      const vA = a[by] ?? '', vB = b[by] ?? ''
      if (typeof vA === 'number' && typeof vB === 'number') return dir === 'asc' ? vA - vB : vB - vA
      return dir === 'asc' ? String(vA).localeCompare(String(vB)) : String(vB).localeCompare(String(vA))
    })
    return lista
  }, [colecao.filmes, colecao.filmeIds, filmes, filtro, sort])

  const assistidos  = filmesColecao.filter(f => f.assistido).length
  const pendentes   = filmesColecao.length - assistidos
  const comNota     = filmesColecao.filter(f => f.nota)
  const mediaNota   = comNota.length
    ? (comNota.reduce((a, f) => a + f.nota, 0) / comNota.length).toFixed(1) : '—'
  const pct         = filmesColecao.length ? Math.round((assistidos / filmesColecao.length) * 100) : 0
  const capas       = filmesColecao.filter(f => f.poster && f.poster !== 'N/A').slice(0, 2)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)', flex: 1 }}>
      {/* Header */}
      <div style={{ padding: '14px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button onClick={onVoltar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
          <i className="ti ti-arrow-left" /> Minhas Listas
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
        <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: 44, height: 44, flexShrink: 0, background: 'var(--surface2)' }}>
          {capas.length > 0
            ? capas.map((f, i) => <img key={i} src={f.poster} alt="" style={{ width: capas.length === 1 ? '100%' : '50%', height: '100%', objectFit: 'cover' }} />)
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ti ti-stack-2" style={{ color: 'var(--text-4)', fontSize: 18 }} /></div>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 1 }}>Coleção</p>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{colecao.nome}</h2>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
          {[
            { label: `${filmesColecao.length} filmes`,   bg: 'var(--surface2)',      color: 'var(--text-3)',  border: 'var(--border)' },
            { label: `★ ${mediaNota} média`,             bg: 'var(--accent-rating-dim)', color: 'var(--accent-rating)', border: 'var(--accent-rating)' },
            { label: `${assistidos} assistidos`,         bg: 'rgba(50,215,75,0.1)', color: 'var(--green)',  border: 'rgba(50,215,75,0.25)' },
            { label: `${pendentes} pendentes`,           bg: 'rgba(255,214,10,0.1)', color: 'var(--yellow)', border: 'rgba(255,214,10,0.25)' },
          ].map(b => <span key={b.label} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: b.bg, color: b.color, border: `0.5px solid ${b.border}` }}>{b.label}</span>)}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ padding: '10px 28px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center' }}>
        {[{ label: 'Todos', valor: 'todos' }, { label: 'Assistidos', valor: 'sim' }, { label: 'Pendentes', valor: 'nao' }].map(tab => (
          <button key={tab.valor} onClick={() => setFiltro(tab.valor)} style={{ padding: '5px 14px', borderRadius: 'var(--radius-md)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: filtro === tab.valor ? 600 : 400, background: filtro === tab.valor ? 'var(--accent)' : 'var(--surface2)', color: filtro === tab.valor ? 'var(--btn-text)' : 'var(--text-3)', border: `1px solid ${filtro === tab.valor ? 'var(--accent)' : 'var(--border)'}` }}>{tab.label}</button>
        ))}
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ marginLeft: 'auto', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-2)', padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
          <option value="adicionado-desc">Mais recente adicionado</option>
          <option value="adicionado-asc">Mais antigo adicionado</option>
          <option value="nota-desc">Nota ↓</option>
          <option value="titulo-asc">Título ↑</option>
          <option value="ano-desc">Ano ↓</option>
          <option value="ano-asc">Ano ↑</option>
        </select>
      </div>

      {/* Barra de progresso */}
      <div style={{ padding: '10px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-4)', flexShrink: 0 }}>{pct}% assistido</span>
        <div style={{ flex: 1, height: 5, background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 'var(--radius-lg)', transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-4)', flexShrink: 0 }}>{assistidos}/{filmesColecao.length}</span>
      </div>

      {/* Grade */}
      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {filmesColecao.length === 0
          ? <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-4)', fontSize: 13 }}>
              <i className="ti ti-movie-off" style={{ fontSize: 36, display: 'block', marginBottom: 12, opacity: 0.4 }} />
              Nenhum filme nesta coleção.
            </div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
              {filmesColecao.map((f, idx) => (
                <div key={f.id} onClick={() => setVerDetalhes(f)}
                  style={{ cursor: 'pointer', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface)', border: '0.5px solid var(--border)', transition: 'border-color .15s, transform .15s', animation: 'fadeSlideIn 0.3s ease both', animationDelay: `${idx * 0.02}s` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ aspectRatio: '2/3', background: 'var(--surface2)', position: 'relative', overflow: 'hidden' }}>
                    {f.poster && f.poster !== 'N/A'
                      ? <img src={f.poster} alt={f.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ti ti-movie" style={{ fontSize: 28, color: 'var(--text-4)', opacity: 0.4 }} /></div>
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0, transition: 'opacity .2s', padding: 10 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                      <i className="ti ti-eye" style={{ fontSize: 22, color: '#fff' }} />
                      <span style={{ fontSize: 10, color: '#fff', textAlign: 'center', fontWeight: 500 }}>Ver detalhes</span>
                    </div>
                    {f.nota && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.7)', color: 'var(--accent-rating)' }}>★ {f.nota.toFixed(1)}</span>}
                    <div style={{ position: 'absolute', top: 6, left: 6, width: 7, height: 7, borderRadius: 'var(--radius-full)', background: f.assistido ? 'var(--green)' : 'var(--yellow)' }} />
                  </div>
                  <div style={{ padding: '7px 8px 8px' }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.titulo}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>{f.ano}{f.genero?.[0] ? ` · ${f.genero[0]}` : ''}</div>
                    <button onClick={e => { e.stopPropagation(); onRemoverFilme(colecao.id, f.id) }}
                      style={{ marginTop: 6, width: '100%', padding: '4px 0', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', fontSize: 10, color: 'var(--text-4)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                      <i className="ti ti-trash" style={{ fontSize: 10, marginRight: 3 }} /> Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
      {verDetalhes && <ModalDetalhes filme={verDetalhes} onFechar={() => setVerDetalhes(null)} />}
    </div>
  )
}

// ── Drag and drop hook simples ────────────────────────────────
function useDragSort(items, onReorder) {
  const dragIdx = useRef(null)
  const dragOver = useRef(null)

  const onDragStart = useCallback((i) => { dragIdx.current = i }, [])
  const onDragEnter = useCallback((i) => { dragOver.current = i }, [])
  const onDragEnd   = useCallback(() => {
    if (dragIdx.current === null || dragOver.current === null || dragIdx.current === dragOver.current) return
    const arr = [...items]
    const [moved] = arr.splice(dragIdx.current, 1)
    arr.splice(dragOver.current, 0, moved)
    dragIdx.current = null
    dragOver.current = null
    onReorder(arr)
  }, [items, onReorder])

  return { onDragStart, onDragEnter, onDragEnd }
}

// ── Lista principal ───────────────────────────────────────────
export default function Colecoes() {
  const filmes   = useAppStore(s => s.filmes)
  const { colecoes, criarColecao, editarColecao, excluirColecao, adicionarFilme, removerFilme } = useColecoes()

  const [colecaoAberta, setColecaoAberta] = useState(null)
  const [criando, setCriando]             = useState(false)
  const [editando, setEditando]           = useState(null)
  const [novoNome, setNovoNome]           = useState('')
  const [novaDesc, setNovaDesc]           = useState('')
  const [adicionandoEm, setAdicionandoEm] = useState(null)
  const [buscaFilme, setBuscaFilme]       = useState('')
  const [busca, setBusca]                 = useState('')
  const [ordemLocal, setOrdemLocal]       = useState(null)
  const [capaEditando, setCapaEditando]   = useState(null)

  const colecaoAtual = colecaoAberta
    ? colecoes.find(c => c.id === colecaoAberta.id) || colecaoAberta
    : null

  // Ordem local para drag and drop
  const colecoesSorted = useMemo(() => {
    if (!ordemLocal) return colecoes
    return ordemLocal.map(id => colecoes.find(c => c.id === id)).filter(Boolean)
  }, [colecoes, ordemLocal])

  // Filtro de busca
  const colecoesFiltradas = useMemo(() =>
    busca ? colecoesSorted.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase())) : colecoesSorted
  , [colecoesSorted, busca])

  const { onDragStart, onDragEnter, onDragEnd } = useDragSort(
    colecoesSorted,
    (novaOrdem) => setOrdemLocal(novaOrdem.map(c => c.id))
  )

  const handleCriar = async () => {
    if (!novoNome.trim()) return
    await criarColecao(novoNome.trim(), novaDesc.trim())
    setNovoNome(''); setNovaDesc(''); setCriando(false)
  }

  const handleEditar = async () => {
    if (!editando || !novoNome.trim()) return
    await editarColecao(editando.id, { nome: novoNome.trim(), descricao: novaDesc.trim() })
    setEditando(null); setNovoNome(''); setNovaDesc('')
  }

  const handleSalvarCapa = async (colecaoId, posterUrl) => {
    await editarColecao(colecaoId, { capaPersonalizada: posterUrl })
    setCapaEditando(null)
  }

  const filmesParaAdicionar = useMemo(() => {
    if (!adicionandoEm) return []
    const jaEstao = new Set(adicionandoEm.filmes || adicionandoEm.filmeIds || [])
    return filmes
      .filter(f => !jaEstao.has(f.id))
      .filter(f => buscaFilme ? f.titulo?.toLowerCase().includes(buscaFilme.toLowerCase()) : true)
      .slice(0, 50)
  }, [adicionandoEm, filmes, buscaFilme])

  if (colecaoAtual) {
    return (
      <ColecaoDetalhe
        colecao={colecaoAtual}
        filmes={filmes}
        onVoltar={() => setColecaoAberta(null)}
        onRemoverFilme={removerFilme}
      />
    )
  }

  return (
    <div style={{ padding: '28px 32px', background: 'var(--bg)', flex: 1 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Biblioteca</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.4px' }}>
              Minhas <span style={{ color: 'var(--accent)' }}>Coleções</span>
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4 }}>{colecoes.length} {colecoes.length === 1 ? 'coleção criada' : 'coleções criadas'}</p>
          </div>
          <button onClick={() => setCriando(true)} className="btn-primary">
            <i className="ti ti-plus" /> Nova coleção
          </button>
        </div>

        {/* Busca entre coleções */}
        {colecoes.length > 2 && (
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-4)', pointerEvents: 'none' }} />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="Buscar coleção..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        )}

        {/* Dica drag and drop */}
        {colecoes.length > 1 && !busca && (
          <p style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-grip-horizontal" style={{ fontSize: 12 }} />
            Arraste para reordenar
          </p>
        )}

        {/* Lista de coleções */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {colecoesFiltradas.map((colecao, idx) => {
            const filmesCol  = filmes.filter(f => (colecao.filmes || colecao.filmeIds || []).includes(f.id))
            const capas      = colecao.capaPersonalizada
              ? [{ poster: colecao.capaPersonalizada }]
              : filmesCol.filter(f => f.poster && f.poster !== 'N/A').slice(0, 4)
            const assistidos = filmesCol.filter(f => f.assistido).length
            const pendentes  = filmesCol.length - assistidos
            const comNota    = filmesCol.filter(f => f.nota)
            const media      = comNota.length ? (comNota.reduce((a, f) => a + f.nota, 0) / comNota.length).toFixed(1) : '—'
            const pct        = filmesCol.length ? Math.round((assistidos / filmesCol.length) * 100) : 0

            return (
              <div
                key={colecao.id}
                draggable={!busca}
                onDragStart={() => onDragStart(idx)}
                onDragEnter={() => onDragEnter(idx)}
                onDragEnd={onDragEnd}
                onDragOver={e => e.preventDefault()}
                onClick={() => setColecaoAberta(colecao)}
                className="colecao-card"
                style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', overflow: 'hidden', transition: 'border-color .15s, transform .18s, box-shadow .18s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Collage / Capa */}
                <div className="colecao-card-cover" style={{ width: 220, minWidth: 220, height: 110, display: 'flex', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {colecao.capaPersonalizada
                    ? <img src={colecao.capaPersonalizada} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : capas.length > 0
                      ? capas.map((f, i) => (
                          <div key={i} style={{ flex: 1, overflow: 'hidden', borderRight: i < capas.length - 1 ? '1px solid var(--bg)' : 'none' }}>
                            <img src={f.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))
                      : <div style={{ flex: 1, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ti ti-stack-2" style={{ fontSize: 24, color: 'var(--text-4)', opacity: 0.4 }} />
                        </div>
                  }
                  <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,0.6)', borderRadius: 'var(--radius-sm)', padding: '2px 6px', fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {filmesCol.length} filmes
                  </div>
                  {/* Barra de progresso sobreposta */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{colecao.nome}</div>
                  {colecao.descricao && (
                    <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{colecao.descricao}</div>
                  )}
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                    {[
                      { n: filmesCol.length, l: 'Filmes',     c: 'var(--text-1)' },
                      { n: `★ ${media}`,     l: 'Média',      c: 'var(--accent-rating)' },
                      { n: assistidos,       l: 'Assistidos', c: 'var(--green)'  },
                      { n: pendentes,        l: 'Pendentes',  c: 'var(--yellow)' },
                    ].map(s => (
                      <div key={s.l} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: s.c, letterSpacing: '-.3px' }}>{s.n}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{s.l}</span>
                      </div>
                    ))}
                  </div>
                  {/* Barra de progresso inline */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 'var(--radius-lg)', transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-4)', flexShrink: 0 }}>{pct}%</span>
                  </div>
                </div>

                {/* Ações */}
                <div onClick={e => e.stopPropagation()} className="colecao-card-actions" style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '10px 12px', borderLeft: '1px solid var(--border)', justifyContent: 'center', flexShrink: 0 }}>
                  {[
                    { icon: 'ti-folder-open', title: 'Abrir',            accent: true,  onClick: () => setColecaoAberta(colecao) },
                    { icon: 'ti-plus',        title: 'Adicionar filmes',               onClick: () => { setAdicionandoEm(colecao); setBuscaFilme('') } },
                    { icon: 'ti-photo',       title: 'Capa personalizada',             onClick: () => setCapaEditando(colecao) },
                    { icon: 'ti-edit',        title: 'Editar',                         onClick: () => { setEditando(colecao); setNovoNome(colecao.nome); setNovaDesc(colecao.descricao || '') } },
                    { icon: 'ti-trash',       title: 'Excluir',          danger: true,  onClick: () => excluirColecao(colecao.id) },
                  ].map(btn => (
                    <button key={btn.icon} onClick={btn.onClick} title={btn.title}
                      style={{ width: 28, height: 28, borderRadius: 'var(--radius-md)', border: `1px solid ${btn.accent ? 'var(--accent)' : 'var(--border)'}`, background: btn.accent ? 'var(--accent)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: btn.accent ? 'var(--btn-text)' : btn.danger ? 'var(--text-4)' : 'var(--text-3)', fontSize: 13, transition: 'all .15s' }}
                      onMouseEnter={e => { if (!btn.accent) { e.currentTarget.style.borderColor = btn.danger ? 'var(--red)' : 'var(--accent)'; e.currentTarget.style.color = btn.danger ? 'var(--red)' : 'var(--accent)' } }}
                      onMouseLeave={e => { if (!btn.accent) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = btn.danger ? 'var(--text-4)' : 'var(--text-3)' } }}
                    >
                      <i className={`ti ${btn.icon}`} />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Empty state de busca */}
          {busca && colecoesFiltradas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-4)', fontSize: 13 }}>
              Nenhuma coleção encontrada para "<strong>{busca}</strong>"
            </div>
          )}
        </div>

        {/* Empty state geral */}
        {colecoes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="ti ti-stack-2" style={{ fontSize: 44, color: 'var(--border2)', display: 'block', marginBottom: 14, opacity: 0.5 }} />
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 6 }}>Você ainda não tem nenhuma coleção.</p>
            <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 20 }}>Organize seus filmes por tema, gênero ou época.</p>
            <button onClick={() => setCriando(true)} className="btn-primary"><i className="ti ti-plus" /> Criar primeira coleção</button>
          </div>
        )}
      </div>

      {/* Modal criar */}
      {criando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(10,10,11,0.92)' }} onClick={() => setCriando(false)}>
          <div className="card" style={{ padding: 24, width: '100%', maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Nova coleção</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input" placeholder="Nome da coleção" value={novoNome} onChange={e => setNovoNome(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleCriar()} />
              <input className="input" placeholder="Descrição (opcional)" value={novaDesc} onChange={e => setNovaDesc(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={handleCriar} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Criar</button>
                <button onClick={() => { setCriando(false); setNovoNome(''); setNovaDesc('') }} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(10,10,11,0.92)' }} onClick={() => setEditando(null)}>
          <div className="card" style={{ padding: 24, width: '100%', maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Editar coleção</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input" placeholder="Nome" value={novoNome} onChange={e => setNovoNome(e.target.value)} autoFocus />
              <input className="input" placeholder="Descrição (opcional)" value={novaDesc} onChange={e => setNovaDesc(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={handleEditar} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Salvar</button>
                <button onClick={() => { setEditando(null); setNovoNome(''); setNovaDesc('') }} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal capa personalizada */}
      {capaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(10,10,11,0.92)' }} onClick={() => setCapaEditando(null)}>
          <div className="card" style={{ padding: 24, width: '100%', maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Capa personalizada</h3>
            <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 16 }}>Escolha um dos filmes da coleção como capa, ou cole uma URL de imagem.</p>

            {/* Filmes da coleção como opção */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 14, maxHeight: 200, overflowY: 'auto' }}>
              {filmes
                .filter(f => (capaEditando.filmes || capaEditando.filmeIds || []).includes(f.id) && f.poster && f.poster !== 'N/A')
                .map(f => (
                  <div key={f.id} onClick={() => handleSalvarCapa(capaEditando.id, f.poster)}
                    style={{ cursor: 'pointer', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: capaEditando.capaPersonalizada === f.poster ? '2px solid var(--accent)' : '0.5px solid var(--border)', transition: 'border-color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => { if (capaEditando.capaPersonalizada !== f.poster) e.currentTarget.style.borderColor = 'var(--border)' }}>
                    <img src={f.poster} alt={f.titulo} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))
              }
            </div>

            {/* URL manual */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder="Ou cole uma URL de imagem..." id="capa-url-input" defaultValue={capaEditando.capaPersonalizada || ''} />
              <button onClick={() => { const url = document.getElementById('capa-url-input').value; if (url) handleSalvarCapa(capaEditando.id, url) }} className="btn-primary" style={{ flexShrink: 0 }}>Usar</button>
            </div>

            {capaEditando.capaPersonalizada && (
              <button onClick={() => handleSalvarCapa(capaEditando.id, '')} style={{ width: '100%', padding: '8px 0', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', fontSize: 12, color: 'var(--red)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
                <i className="ti ti-x" style={{ marginRight: 5 }} /> Remover capa personalizada
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal adicionar filmes */}
      {adicionandoEm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(10,10,11,0.92)' }} onClick={() => { setAdicionandoEm(null); setBuscaFilme('') }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Adicionar filmes — {adicionandoEm.nome}</h3>
              <button onClick={() => { setAdicionandoEm(null); setBuscaFilme('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 18 }}><i className="ti ti-x" /></button>
            </div>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
              <input className="input" placeholder="Buscar filme..." value={buscaFilme} onChange={e => setBuscaFilme(e.target.value)} autoFocus />
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {filmesParaAdicionar.map(filme => (
                <div key={filme.id}
                  onClick={async () => { await adicionarFilme(adicionandoEm.id, filme.id); setAdicionandoEm(prev => prev ? { ...prev, filmes: [...(prev.filmes || prev.filmeIds || []), filme.id] } : null) }}
                  style={{ cursor: 'pointer', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '0.5px solid var(--border)', transition: 'border-color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ aspectRatio: '2/3', background: 'var(--surface2)', position: 'relative', overflow: 'hidden' }}>
                    {filme.poster && filme.poster !== 'N/A'
                      ? <img src={filme.poster} alt={filme.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ti ti-movie" style={{ fontSize: 20, color: 'var(--text-4)', opacity: 0.4 }} /></div>
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity .15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                      <i className="ti ti-plus" style={{ fontSize: 22, color: '#fff' }} />
                    </div>
                  </div>
                  <div style={{ padding: '5px 6px', background: 'var(--surface)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{filme.titulo}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-4)' }}>{filme.ano}</div>
                  </div>
                </div>
              ))}
              {filmesParaAdicionar.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-4)', fontSize: 12 }}>
                  {buscaFilme ? 'Nenhum resultado.' : 'Todos os filmes já foram adicionados.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}