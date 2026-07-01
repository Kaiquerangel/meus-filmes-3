import { useState, useRef, useCallback } from 'react'
import { useSearch, buscarDetalhes } from '../services/useSearch'

export default function BuscaFilme({ onSelect }) {
  const [query, setQuery]         = useState('')
  const { sugestoes, buscando, buscar, limpar } = useSearch()
  const [carregando, setCarregando] = useState(false)
  const debounceRef               = useRef(null)

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => buscar(val), 380)
  }

  const handleSelect = useCallback(async (item) => {
    if (!item.imdbID) return
    limpar()
    setCarregando(true)
    try {
      const detalhes = await buscarDetalhes(item.imdbID)
      setQuery(detalhes.Title)
      onSelect(detalhes)
    } catch (e) {
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }, [limpar, onSelect])

  const handleBlur = () => {
    setTimeout(() => limpar(), 160)
  }

  const isLoading = buscando || carregando

  return (
    <div className="busca-wrapper" style={{ position: 'relative' }}>
      {/* Input + Botão integrados */}
      <div className="busca-container" style={{
        display: 'flex',
        height: 42,
        background: 'var(--surface)',
        border: '1px solid var(--border2)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'border-color 0.14s, box-shadow 0.14s',
      }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = 'var(--border-focus)'
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = 'var(--border2)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Ícone de busca */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 13,
          flexShrink: 0,
        }}>
          {isLoading
            ? <i className="ti ti-loader-2 animate-spin" style={{ fontSize: 14, color: 'var(--text-3)' }} />
            : <i className="ti ti-search" style={{ fontSize: 14, color: 'var(--text-4)' }} />
          }
        </div>

        {/* Input */}
        <input
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '0 12px',
            fontSize: 14,
            color: 'var(--text-1)',
            fontFamily: 'inherit',
          }}
          placeholder="Buscar filme por título..."
          value={query}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={e => e.key === 'Enter' && buscar(query)}
        />

        {/* Botão buscar */}
        <button
          type="button"
          onClick={() => buscar(query)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 18px',
            background: 'var(--accent)',
            color: 'var(--btn-text)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            transition: 'background 0.14s',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          <i className="ti ti-search" style={{ fontSize: 13 }} />
          Buscar
        </button>
      </div>

      {/* Dropdown de sugestões */}
      {sugestoes.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 5px)',
          left: 0, right: 0,
          zIndex: 50,
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeSlideDown 0.18s var(--ease-out) both',
        }}>
          {sugestoes.map((item, i) => (
            <div
              key={item.imdbID}
              onMouseDown={() => handleSelect(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: i < sugestoes.length - 1
                  ? '1px solid var(--border)'
                  : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Thumbnail */}
              <div style={{
                width: 30,
                height: 44,
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'var(--surface2)',
                flexShrink: 0,
                border: '1px solid var(--border)',
              }}>
                {item.Poster && item.Poster !== 'N/A'
                  ? (
                    <img
                      src={item.Poster}
                      alt={item.Title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )
                  : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="ti ti-movie" style={{ fontSize: 12, color: 'var(--text-4)' }} />
                    </div>
                  )
                }
              </div>

              {/* Info */}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-1)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                }}>
                  {item.Title}
                </div>
                <div style={{
                  fontSize: 11,
                  color: 'var(--text-4)',
                  marginTop: 2,
                }}>
                  {item.Year}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
