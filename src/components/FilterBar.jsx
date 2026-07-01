export default function FilterBar({ filtros, setFiltro, limparFiltros }) {
  const filtrosAtivos = [
    filtros.busca,
    filtros.genero,
    filtros.tag,
    filtros.diretor,
    filtros.ator,
    filtros.notaMin != null ? filtros.notaMin : '',
    filtros.notaMax != null ? filtros.notaMax : '',
    filtros.periodo,
    filtros.dataInicio,
    filtros.dataFim,
    filtros.anoLancamento,
    filtros.anoAssistido,
    filtros.origem && filtros.origem !== 'todos' ? filtros.origem : '',
    filtros.status && filtros.status !== 'todos' ? filtros.status : '',
  ].filter(Boolean).length

  const cellStyle = (borderRight = true) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '0 13px',
    flex: 1,
    minWidth: 0,
    borderRight: borderRight ? '1px solid var(--border)' : 'none',
  })

  const inputStyle = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: 13,
    color: 'var(--text-1)',
    fontFamily: 'inherit',
    padding: '10px 0',
    minWidth: 0,
  }

  const selectStyle = (hasValue) => ({
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: 12,
    color: hasValue ? 'var(--text-1)' : 'var(--text-3)',
    fontFamily: 'inherit',
    padding: '10px 12px',
    cursor: 'pointer',
    appearance: 'none',
    whiteSpace: 'nowrap',
  })

  const iconStyle = {
    fontSize: 13,
    color: 'var(--text-4)',
    flexShrink: 0,
  }

  return (
    <div style={{
      margin: '8px 24px 4px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>

      {/* Linha 1 — busca e campos de texto */}
      <div className="filter-bar__row filter-bar__row--main" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
        borderBottom: '1px solid var(--border)',
        minHeight: 42,
      }}>
        {/* Busca */}
        <div style={cellStyle()}>
          <i className="ti ti-search" style={iconStyle} />
          <input
            style={inputStyle}
            placeholder="Buscar título..."
            value={filtros.busca || ''}
            onChange={e => setFiltro('busca', e.target.value)}
          />
        </div>

        {[
          { key: 'genero',  placeholder: 'Gênero...',  icon: 'ti-tag' },
          { key: 'tag',     placeholder: 'Tag...',      icon: 'ti-hash' },
          { key: 'diretor', placeholder: 'Direção...',  icon: 'ti-video' },
          { key: 'ator',    placeholder: 'Artista...',  icon: 'ti-user', last: true },
        ].map(f => (
          <div key={f.key} style={cellStyle(!f.last)}>
            <i className={`ti ${f.icon}`} style={iconStyle} />
            <input
              style={inputStyle}
              placeholder={f.placeholder}
              value={filtros[f.key] || ''}
              onChange={e => setFiltro(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Linha 2 — filtros avançados */}
      <div className="filter-bar__row filter-bar__row--advanced" style={{
        display: 'flex',
        alignItems: 'stretch',
        flexWrap: 'wrap',
        minHeight: 38,
      }}>

        {/* Nota min/max */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 13px',
          borderRight: '1px solid var(--border)',
        }}>
          <i className="ti ti-star-filled" style={{ fontSize: 11, color: 'var(--accent-rating)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--text-4)', flexShrink: 0 }}>Nota</span>
          <input
            type="number"
            min="0" max="10" step="0.5"
            placeholder="Mín"
            value={filtros.notaMin || ''}
            onChange={e => setFiltro('notaMin', e.target.value ? parseFloat(e.target.value) : null)}
            style={{
              width: 36,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 12,
              color: 'var(--text-1)',
              textAlign: 'center',
              fontFamily: 'inherit',
              padding: '9px 0',
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--border2)' }}>–</span>
          <input
            type="number"
            min="0" max="10" step="0.5"
            placeholder="Máx"
            value={filtros.notaMax || ''}
            onChange={e => setFiltro('notaMax', e.target.value ? parseFloat(e.target.value) : null)}
            style={{
              width: 36,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 12,
              color: 'var(--text-1)',
              textAlign: 'center',
              fontFamily: 'inherit',
              padding: '9px 0',
            }}
          />
        </div>

        {/* Período */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
          <select
            value={filtros.periodo || ''}
            onChange={e => setFiltro('periodo', e.target.value)}
            style={selectStyle(!!filtros.periodo)}
          >
            <option value="">Período</option>
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">3 meses</option>
            <option value="180">6 meses</option>
            <option value="365">1 ano</option>
          </select>
        </div>

        {/* Data início → fim */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 12px',
          borderRight: '1px solid var(--border)',
        }}>
          <input
            type="date"
            value={filtros.dataInicio || ''}
            onChange={e => setFiltro('dataInicio', e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 11,
              color: filtros.dataInicio ? 'var(--text-1)' : 'var(--text-4)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              padding: '9px 0',
            }}
          />
          <i className="ti ti-arrow-right" style={{ fontSize: 10, color: 'var(--border2)', flexShrink: 0 }} />
          <input
            type="date"
            value={filtros.dataFim || ''}
            onChange={e => setFiltro('dataFim', e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 11,
              color: filtros.dataFim ? 'var(--text-1)' : 'var(--text-4)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              padding: '9px 0',
            }}
          />
        </div>

        {/* Ano lançamento */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
          <select
            value={filtros.anoLancamento || ''}
            onChange={e => setFiltro('anoLancamento', e.target.value)}
            style={selectStyle(!!filtros.anoLancamento)}
          >
            <option value="">Lançamento</option>
            {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Ano assistido */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
          <select
            value={filtros.anoAssistido || ''}
            onChange={e => setFiltro('anoAssistido', e.target.value)}
            style={selectStyle(!!filtros.anoAssistido)}
          >
            <option value="">Assistido em</option>
            {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Origem */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
          <select
            value={filtros.origem || 'todos'}
            onChange={e => setFiltro('origem', e.target.value)}
            style={selectStyle(filtros.origem && filtros.origem !== 'todos')}
          >
            <option value="todos">Origem</option>
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
          </select>
        </div>

        {/* Status */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
          <select
            value={filtros.status || 'todos'}
            onChange={e => setFiltro('status', e.target.value)}
            style={selectStyle(filtros.status && filtros.status !== 'todos')}
          >
            <option value="todos">Status</option>
            <option value="sim">Assistidos</option>
            <option value="nao">Não assistidos</option>
          </select>
        </div>

        {/* Limpar */}
        <button
          onClick={limparFiltros}
          disabled={filtrosAtivos === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '0 13px',
            background: 'none',
            border: 'none',
            fontSize: 12,
            fontWeight: 500,
            color: filtrosAtivos > 0 ? 'var(--red)' : 'var(--text-4)',
            cursor: filtrosAtivos > 0 ? 'pointer' : 'default',
            fontFamily: 'inherit',
            marginLeft: 'auto',
            opacity: filtrosAtivos > 0 ? 1 : 0.4,
            transition: 'opacity 0.14s, color 0.14s',
            whiteSpace: 'nowrap',
          }}
        >
          <i className="ti ti-x" style={{ fontSize: 11 }} />
          Limpar
          {filtrosAtivos > 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              background: 'var(--red)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 'var(--radius-pill)',
              lineHeight: 1,
            }}>
              {filtrosAtivos}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
