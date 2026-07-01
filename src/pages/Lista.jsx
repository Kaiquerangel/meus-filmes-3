import { useState, useRef, useEffect, useCallback } from 'react'
import { useMovies } from '../services/useMovies'
import { useFilters } from '../services/useFilters'
import { useAppStore } from '../store/useAppStore'
import MovieCard from '../components/MovieCard'
import FilterBar from '../components/FilterBar'
import ModalEdicao from '../components/ModalEdicao'
import ModalDetalhes from '../components/ModalDetalhes'
import ModalSugerir from '../components/ModalSugerir'
import ModalIndicar from '../components/ModalIndicar'
import ModalComparar from '../components/ModalComparar'
import ModalSyncPosters from '../components/ModalSyncPosters'
import ModalSyncBackdrops from '../components/ModalSyncBackdrops'

// ── Exportar JSON ──
function exportarJSON(filmes) {
  const blob = new Blob([JSON.stringify(filmes, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'meus-filmes.json'; a.click()
  URL.revokeObjectURL(url)
}

// ── Exportar CSV ──
function exportarCSV(filmes) {
  const cols = ['titulo', 'ano', 'nota', 'genero', 'direcao', 'origem', 'assistido', 'dataAssistido', 'plataforma']
  const header = cols.join(',')
  const rows = filmes.map(f =>
    cols.map(c => {
      const v = Array.isArray(f[c]) ? f[c].join(';') : (f[c] ?? '')
      return `"${String(v).replace(/"/g, '""')}"`
    }).join(',')
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'meus-filmes.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ── Importar JSON ──
function useImportarJSON(onImport) {
  const ref = useRef()
  const abrir = () => ref.current?.click()
  const input = (
    <input
      ref={ref}
      type="file"
      accept=".json"
      style={{ display: 'none' }}
      onChange={e => {
        const file = e.target.files?.[0]
        if (!file) return
        // Limita a 10MB para evitar travamento do browser
        if (file.size > 10 * 1024 * 1024) {
          alert('Arquivo muito grande. Limite: 10MB.')
          e.target.value = ''
          return
        }
        const reader = new FileReader()
        reader.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result)
            onImport(Array.isArray(data) ? data : [])
          } catch { alert('Arquivo JSON inválido.') }
        }
        reader.readAsText(file)
        e.target.value = ''
      }}
    />
  )
  return { abrir, input }
}

// ── Importar Letterboxd ──
function useImportarLetterboxd(onImport) {
  const ref = useRef()
  const abrir = () => ref.current?.click()
  const input = (
    <input
      ref={ref}
      type="file"
      accept=".csv"
      style={{ display: 'none' }}
      onChange={e => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
          alert('Arquivo CSV muito grande. Limite: 5MB.')
          e.target.value = ''
          return
        }
        const reader = new FileReader()
        reader.onload = ev => {
          try {
            const text = ev.target.result
            const lines = text.split('\n').filter(l => l.trim())
            if (!lines.length) return

            function parseCSVLine(line) {
              const result = []
              let cur = '', inQuotes = false
              for (let i = 0; i < line.length; i++) {
                const ch = line[i]
                if (ch === '"') {
                  if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
                  else inQuotes = !inQuotes
                } else if (ch === ',' && !inQuotes) {
                  result.push(cur.trim()); cur = ''
                } else { cur += ch }
              }
              result.push(cur.trim())
              return result
            }

            const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
            const filmes = lines.slice(1).map(line => {
              const vals = parseCSVLine(line)
              const obj = {}
              header.forEach((h, i) => { obj[h] = vals[i] || '' })
              const rating = obj['rating'] ? parseFloat(obj['rating']) : null
              const notaRaw = rating ? rating * 2 : null
              const nota = notaRaw ? Math.min(10, Math.max(0, notaRaw)) : null
              const watchedDate = obj['watched date'] || obj['watcheddate'] || obj['date'] || null
              return {
                titulo: obj['name'] || obj['title'] || '',
                ano: parseInt(obj['year']) || null,
                nota,
                assistido: !!watchedDate,
                dataAssistido: watchedDate ? watchedDate.trim() : null,
                genero: [], direcao: [], atores: [],
                origem: 'Internacional',
                tags: obj['tags'] ? obj['tags'].split(',').map(t => t.trim()).filter(Boolean) : [],
                importadoLetterboxd: true,
              }
            }).filter(f => f.titulo && f.titulo.length <= 300)
            onImport(filmes)
          } catch (err) {
            alert('Erro ao ler o arquivo. Certifique-se que é um CSV exportado do Letterboxd.')
          }
        }
        reader.readAsText(file)
        e.target.value = ''
      }}
    />
  )
  return { abrir, input }
}

function ActionBtn({ label, icon, color, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 'var(--radius-pill)',
        background: color && !color.startsWith('var') ? `${color}18` : 'var(--surface)',
        border: `1px solid ${color && !color.startsWith('var') ? `${color}40` : 'var(--border)'}`,
        color: color || 'var(--text-2)',
        fontSize: 12, fontWeight: 500, cursor: 'pointer',
        fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 13 }} />
      {label}
    </button>
  )
}


// ── Infinite Scroll — só mobile ─────────────────────────────
const MOBILE_PAGE = 40  // filmes por lote no mobile

function useInfiniteScrollMobile(lista) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const [limite, setLimite] = useState(isMobile ? MOBILE_PAGE : Infinity)
  const observerRef = useRef(null)

  // Reseta quando a lista muda (filtro aplicado)
  useEffect(() => {
    setLimite(isMobile ? MOBILE_PAGE : Infinity)
  }, [lista])

  // Callback ref — recria o observer toda vez que o sentinel é montado/desmontado
  const sentinelRef = useCallback((node) => {
    // Desconecta observer anterior
    if (observerRef.current) observerRef.current.disconnect()
    if (!node || !isMobile) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLimite(prev => {
            const novo = Math.min(prev + MOBILE_PAGE, lista.length)
            return novo
          })
        }
      },
      { rootMargin: '400px', threshold: 0 }
    )
    observerRef.current.observe(node)
  }, [lista.length, isMobile])

  const visiveis  = lista.slice(0, limite)
  const temMais   = limite < lista.length
  const restantes = lista.length - limite

  return { visiveis, temMais, restantes, sentinelRef }
}

export default function Lista() {
  const { excluir, toggleAssistido, toggleFavorito, reavaliar, salvar } = useMovies()
  const { filtrados, filtros, setFiltro, limparFiltros, sortBy, sortDir, setSort } = useFilters()
  const { viewMode, setViewMode, filmes } = useAppStore()

  const [filmeEditando, setFilmeEditando]   = useState(null)
  const [filmeDetalhes, setFilmeDetalhes]   = useState(null)
  const [modalSugerir, setModalSugerir]     = useState(false)
  const [modalIndicar, setModalIndicar]     = useState(false)
  const [modalComparar, setModalComparar]   = useState(false)
  const [importFeedback, setImportFeedback] = useState('')
  const [modalSync, setModalSync]             = useState(false)
  const [modalSyncBackdrop, setModalSyncBackdrop] = useState(false)
  const [maisAcoes, setMaisAcoes]             = useState(false)

  const assistidos = filtrados.filter(f => f.assistido).length

  // Infinite scroll mobile
  const { visiveis, temMais, restantes, sentinelRef } = useInfiniteScrollMobile(filtrados)

  const handleImportJSON = async (data) => {
    let count = 0
    for (const f of data) {
      try { await salvar(f); count++ } catch {}
    }
    setImportFeedback(`${count} filmes importados!`)
    setTimeout(() => setImportFeedback(''), 4000)
  }

  const handleImportLetterboxd = async (data) => {
    let count = 0
    for (const f of data) {
      try { await salvar(f); count++ } catch {}
    }
    setImportFeedback(`${count} filmes importados do Letterboxd!`)
    setTimeout(() => setImportFeedback(''), 4000)
  }

  const { abrir: abrirJSON,       input: inputJSON }       = useImportarJSON(handleImportJSON)
  const { abrir: abrirLetterboxd, input: inputLetterboxd } = useImportarLetterboxd(handleImportLetterboxd)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', flex: 1 }}>

      {/* ── Topbar ── */}
      <div className="lista-topbar" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px 24px 0' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.4px', display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
            Lista de <span style={{ color: 'var(--accent)' }}>Filmes</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>
            {filtrados.length} filmes · {assistidos} assistidos
          </p>
        </div>

        <div className="lista-controls" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Toggle Cards / Tabela */}
          <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {[
              { mode: 'cards',  icon: 'ti-layout-grid', label: 'Cards' },
              { mode: 'tabela', icon: 'ti-table',        label: 'Tabela' },
            ].map(({ mode, icon, label }, i) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', fontSize: 12, fontWeight: 500,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all .15s',
                  background: viewMode === mode ? 'var(--accent)' : 'transparent',
                  color: viewMode === mode ? 'var(--btn-text)' : 'var(--text-3)',
                  borderRight: i === 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <i className={`ti ${icon}`} style={{ fontSize: 14 }} />
                {label}
              </button>
            ))}
          </div>

          {/* Ordenação */}
          <select
            className="input lista-sort-select"
            style={{ width: 190, fontSize: 12 }}
            value={`${sortBy}-${sortDir}`}
            onChange={e => {
              const [by, dir] = e.target.value.split('-')
              setSort(by, dir)
            }}
          >
            <optgroup label="Cadastro">
              <option value="cadastradoEm-asc">↑ Mais antigo cadastrado</option>
              <option value="cadastradoEm-desc">↓ Mais recente cadastrado</option>
            </optgroup>
            <optgroup label="Nota">
              <option value="nota-desc">↓ Nota maior</option>
              <option value="nota-asc">↑ Nota menor</option>
            </optgroup>
            <optgroup label="Título">
              <option value="titulo-asc">↑ Título A–Z</option>
              <option value="titulo-desc">↓ Título Z–A</option>
            </optgroup>
            <optgroup label="Ano">
              <option value="ano-desc">↓ Ano mais recente</option>
              <option value="ano-asc">↑ Ano mais antigo</option>
            </optgroup>
            <optgroup label="Data assistido">
              <option value="dataAssistido-desc">↓ Assistido recentemente</option>
              <option value="dataAssistido-asc">↑ Assistido há mais tempo</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* ── Barra de ações ── */}
      <div className="lista-actions" style={{ display: 'flex', gap: 8, padding: '12px 24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <ActionBtn label="Sugerir"  icon="ti-sparkles" color="var(--text-2)" onClick={() => setModalSugerir(true)} />
        <ActionBtn label="Indicar"  icon="ti-send"     color="var(--text-2)" onClick={() => setModalIndicar(true)} />
        <ActionBtn label="Coleções" icon="ti-bookmark" color="var(--text-2)" onClick={() => window.location.href = '/colecoes'} />

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />

        {/* Mais ações — dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMaisAcoes(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 'var(--radius-pill)',
              background: maisAcoes ? 'var(--surface2)' : 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-2)', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            <i className="ti ti-dots" style={{ fontSize: 13 }} /> Mais ações
          </button>

          {maisAcoes && (
            <>
              {/* overlay para fechar */}
              <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setMaisAcoes(false)} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
                background: 'var(--surface)', border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 6, minWidth: 200,
                boxShadow: 'var(--shadow-modal)',
              }}>
                {[
                  { label: 'Comparar',       icon: 'ti-users',        color: 'var(--text-2)', onClick: () => { setModalComparar(true);     setMaisAcoes(false) } },
                  { label: 'Letterboxd',     icon: 'ti-upload',       color: '#00e054', onClick: () => { abrirLetterboxd();           setMaisAcoes(false) }, title: 'Importar CSV do Letterboxd' },
                  { label: 'Exportar JSON',  icon: 'ti-download',     color: 'var(--text-2)', onClick: () => { exportarJSON(filmes); setMaisAcoes(false) } },
                  { label: 'Exportar CSV',   icon: 'ti-file-text',    color: 'var(--text-2)', onClick: () => { exportarCSV(filmes);  setMaisAcoes(false) } },
                  { label: 'Importar JSON',  icon: 'ti-file-import',  color: 'var(--text-2)', onClick: () => { abrirJSON();          setMaisAcoes(false) } },
                  null,
                  { label: 'Sync Pôsteres',  icon: 'ti-photo-search', color: 'var(--text-2)', onClick: () => { setModalSync(true);         setMaisAcoes(false) } },
                  { label: 'Sync Backdrops', icon: 'ti-photo-star',   color: 'var(--text-2)', onClick: () => { setModalSyncBackdrop(true); setMaisAcoes(false) } },
                ].map((item, i) =>
                  item === null
                    ? <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 6px' }} />
                    : (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        title={item.title}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                          padding: '8px 10px', borderRadius: 'var(--radius-md)', border: 'none',
                          background: 'transparent', color: item.color, fontSize: 13,
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className={`ti ${item.icon}`} style={{ fontSize: 15, flexShrink: 0 }} />
                        {item.label}
                      </button>
                    )
                )}
              </div>
            </>
          )}
        </div>

        {importFeedback && (
          <span style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-circle-check" /> {importFeedback}
          </span>
        )}

        {inputJSON}
        {inputLetterboxd}
      </div>

      {/* ── Filtros ── */}
      <FilterBar filtros={filtros} setFiltro={setFiltro} limparFiltros={limparFiltros} />

      {/* ── Tabs ── */}
      <div className="lista-tabs-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px 4px' }}>
        <div className="lista-tabs" style={{ display: 'flex', gap: 4 }}>
          {[
            { label: 'Todos',          valor: 'todos' },
            { label: 'Assistidos',     valor: 'sim' },
            { label: 'Não Assistidos', valor: 'nao' },
            { label: '★ Favoritos',    valor: 'favoritos' },
          ].map(tab => (
            <button
              key={tab.valor}
              onClick={() => setFiltro('status', tab.valor)}
              style={{
                padding: '6px 14px', fontSize: 12, borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all .15s', border: '1px solid',
                borderColor: filtros.status === tab.valor ? 'var(--border2)' : 'transparent',
                background: filtros.status === tab.valor
                  ? tab.valor === 'favoritos' ? 'var(--accent-rating-dim)' : 'var(--surface2)'
                  : 'transparent',
                color: filtros.status === tab.valor
                  ? tab.valor === 'favoritos' ? 'var(--accent-rating)' : 'var(--text-1)'
                  : 'var(--text-3)',
                fontWeight: filtros.status === tab.valor ? 500 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
          Exibindo <strong style={{ color: 'var(--text-2)' }}>{filtrados.length}</strong> filmes
        </span>
      </div>

      {/* ── Grid de cards ── */}
      {viewMode === 'cards' && (
        <div className="lista-grid" style={{
          padding: '12px 24px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 14,
        }}>
          {visiveis.map(filme => (
            <MovieCard
              key={filme.id}
              filme={filme}
              onVerDetalhes={f => setFilmeDetalhes(f)}
              onEdit={f => setFilmeEditando(f)}
              onDelete={excluir}
              onToggle={toggleAssistido}
              onFavorito={toggleFavorito}
              onAddColecao={() => window.location.href = '/colecoes'}
            />
          ))}

          {filtrados.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--text-4)', fontSize: 13 }}>
              Nenhum filme encontrado.
            </div>
          )}

          {/* Sentinel + indicador de carregamento — só mobile */}
          {temMais && (
            <div
              ref={sentinelRef}
              className="lista-sentinel"
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '20px 0 8px',
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '2px solid var(--border2)',
                borderTopColor: 'var(--accent)',
                animation: 'spin 0.7s linear infinite',
              }} />
              <span style={{
                fontSize: 11,
                color: 'var(--text-4)',
              }}>
                mais {restantes} filmes
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Tabela ── */}
      {viewMode === 'tabela' && (
        <div className="kra-table-wrapper" style={{ padding: '12px 24px 24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ width: 32, padding: '8px 10px', textAlign: 'right', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-4)' }}>#</th>
                <th style={{ width: 40, padding: '8px 10px' }} />
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-4)' }}>Título</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-4)', width: 60 }}>Ano</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-4)', width: 70 }}>Nota</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-4)' }}>Gênero</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-4)' }}>Direção</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-4)', width: 90 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-4)', width: 100 }}>Data</th>
                <th style={{ width: 150 }} />
              </tr>
            </thead>
            <tbody>
              {filtrados.map(filme => (
                <tr
                  key={filme.id}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setFilmeDetalhes(filme)}
                >
                  {/* Numeração */}
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 11, color: 'var(--text-4)', fontWeight: 500, width: 32 }}>
                    {filtrados.indexOf(filme) + 1}
                  </td>

                  {/* Favorito */}
                  <td style={{ padding: '10px 10px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); toggleFavorito(filme) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: filme.favorito ? 'var(--accent-rating)' : 'var(--border2)', fontSize: 13 }}
                    >
                      <i className={`ti ${filme.favorito ? 'ti-star-filled' : 'ti-star'}`} />
                    </button>
                  </td>

                  {/* Título + pôster + tags */}
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 44, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0 }}>
                        {filme.poster && filme.poster !== 'N/A'
                          ? <img src={filme.poster} alt={filme.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="ti ti-movie" style={{ fontSize: 12, color: 'var(--border2)' }} />
                            </div>
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                          {filme.titulo}
                        </div>
                        {filme.tags?.filter(t => t).length > 0 && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                            {filme.tags.filter(t => t).slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                style={{ fontSize: 9, padding: '1px 6px', borderRadius: 'var(--radius-lg)', background: 'var(--surface2)', color: 'var(--text-4)', border: '0.5px solid var(--border)', fontWeight: 500 }}
                              >
                                # {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Ano */}
                  <td style={{ padding: '10px 10px', color: 'var(--text-3)' }}>{filme.ano}</td>

                  {/* Nota */}
                  <td style={{ padding: '10px 10px', color: 'var(--accent-rating)', fontWeight: 600 }}>
                    {filme.nota ? `★ ${filme.nota.toFixed(1)}` : '—'}
                  </td>

                  {/* Gênero */}
                  <td style={{ padding: '10px 10px', color: 'var(--text-3)', maxWidth: 180 }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {filme.genero?.join(', ')}
                    </span>
                  </td>

                  {/* Direção */}
                  <td style={{ padding: '10px 10px', color: 'var(--text-3)', maxWidth: 160 }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {filme.direcao?.join(', ')}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '10px 10px' }}>
                    {filme.assistido
                      ? <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="ti ti-check" style={{ fontSize: 12 }} /> Assistido
                        </span>
                      : <span title="Pendente — não assistido ainda" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="ti ti-clock" style={{ fontSize: 14, color: 'var(--yellow)' }} />
                        </span>
                    }
                  </td>

                  {/* Data */}
                  <td style={{ padding: '10px 10px', color: 'var(--text-4)', fontSize: 11 }}>
                    {filme.dataAssistido || '—'}
                  </td>

                  {/* Ações */}
                  <td style={{ padding: '10px 10px' }}>
                    <div
                      className="row-actions"
                      style={{ display: 'flex', gap: 3, opacity: 0, transition: 'opacity .15s' }}
                    >
                      {[
                        { icon: filme.assistido ? 'ti-eye-off' : 'ti-eye', action: () => toggleAssistido(filme), title: filme.assistido ? 'Desmarcar' : 'Marcar assistido', hoverColor: 'var(--green)' },
                        { icon: 'ti-edit',          action: () => setFilmeEditando(filme),    title: 'Editar',               hoverColor: 'var(--text-1)' },
                        { icon: 'ti-bookmark-plus', action: () => window.location.href = '/colecoes', title: 'Adicionar à coleção', hoverColor: '#f59e0b' },
                        { icon: 'ti-send',          action: () => setModalIndicar(true),      title: 'Indicar para amigo',   hoverColor: '#22c55e' },
                        { icon: 'ti-trash',         action: () => excluir(filme.id),          title: 'Excluir',              hoverColor: 'var(--red)' },
                      ].map(btn => (
                        <button
                          key={btn.icon}
                          onClick={e => { e.stopPropagation(); btn.action() }}
                          title={btn.title}
                          style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}
                          onMouseEnter={e => e.currentTarget.style.color = btn.hoverColor}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                        >
                          <i className={`ti ${btn.icon}`} />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-4)', fontSize: 13 }}>
              Nenhum filme encontrado.
            </div>
          )}
        </div>
      )}

      {/* ── Modais ── */}
      {filmeDetalhes && (
        <ModalDetalhes
          filme={filmeDetalhes}
          onFechar={() => setFilmeDetalhes(null)}
          onEditar={f => { setFilmeDetalhes(null); setFilmeEditando(f) }}
          onToggleFavorito={toggleFavorito}
          onToggleAssistido={toggleAssistido}
          onReavaliar={async (f, nota) => {
            await reavaliar(f, nota)
            setFilmeDetalhes(prev => prev ? { ...prev, nota } : null)
          }}
        />
      )}

      {filmeEditando && (
        <ModalEdicao
          filme={filmeEditando}
          onFechar={() => setFilmeEditando(null)}
        />
      )}

      {modalSugerir && (
        <ModalSugerir
          filmes={filmes}
          onFechar={() => setModalSugerir(false)}
          onMarcarAssistido={toggleAssistido}
        />
      )}

      {modalIndicar && (
        <ModalIndicar onFechar={() => setModalIndicar(false)} />
      )}

      {modalComparar && (
        <ModalComparar onFechar={() => setModalComparar(false)} />
      )}

      {modalSync && (
        <ModalSyncPosters onFechar={() => setModalSync(false)} />
      )}
      {modalSyncBackdrop && (
        <ModalSyncBackdrops onFechar={() => setModalSyncBackdrop(false)} />
      )}

      <style>{`
        tr:hover .row-actions { opacity: 1 !important; }
      `}</style>
    </div>
  )
}