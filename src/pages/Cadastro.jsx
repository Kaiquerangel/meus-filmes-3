import { useState } from 'react'
import { useMovies } from '../services/useMovies'
import BuscaFilme from '../components/BuscaFilme'

const GENEROS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'Thriller', 'War', 'Western',
]

function tagsDaOMDb(str) {
  if (!str || str === 'N/A') return []
  return str.split(',').map(s => s.trim()).filter(Boolean)
}

function StarRating({ nota, onChange }) {
  const [hover, setHover] = useState(null)
  const stars  = [2, 4, 6, 8, 10]
  const parsed = parseFloat(nota)
  const active = hover ?? (isNaN(parsed) ? 0 : parsed)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    }}>
      {stars.map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          onMouseEnter={() => setHover(v)}
          onMouseLeave={() => setHover(null)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
            transition: 'transform 0.15s var(--ease-bounce)',
            transform: hover === v ? 'scale(1.25)' : 'scale(1)',
          }}
        >
          <i
            className={`ti ${active >= v ? 'ti-star-filled' : 'ti-star'}`}
            style={{
              fontSize: 22,
              color: active >= v ? 'var(--accent-rating)' : 'var(--surface3)',
              transition: 'color 0.12s',
              display: 'block',
            }}
          />
        </button>
      ))}
    </div>
  )
}

function FieldGroup({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'var(--text-4)',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function Cadastro({ filmeParaEditar, onConcluir, inModal = false }) {
  const { salvar } = useMovies()
  const [loading, setLoading] = useState(false)
  const [erro, setErro]       = useState('')
  const [sucesso, setSucesso] = useState(false)

  const [form, setForm] = useState({
    titulo:        filmeParaEditar?.titulo        || '',
    ano:           filmeParaEditar?.ano           || '',
    nota:          filmeParaEditar?.nota          || '',
    direcao:       filmeParaEditar?.direcao       || [],
    atores:        filmeParaEditar?.atores        || [],
    genero:        filmeParaEditar?.genero        || [],
    origem:        filmeParaEditar?.origem        || 'Internacional',
    assistido:     filmeParaEditar?.assistido     || false,
    dataAssistido: filmeParaEditar?.dataAssistido || '',
    poster:        filmeParaEditar?.poster        || '',
    backdrop:      filmeParaEditar?.backdrop      || '',
    imdbID:        filmeParaEditar?.imdbID        || '',
    estudio:       filmeParaEditar?.estudio       || '',
    duracao:       filmeParaEditar?.duracao       || '',
    review:        filmeParaEditar?.review        || '',
    tags:          filmeParaEditar?.tags          || [],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAutoFill = (omdb) => {
    const paises   = omdb.Country || ''
    const origem   = paises.toLowerCase().includes('brazil') ? 'Nacional' : 'Internacional'
    const duracao  = parseInt(omdb.Runtime) || ''
    const estudio  = [omdb.Production, omdb.Studio, omdb.Distributor]
      .find(v => v && v !== 'N/A' && v.trim() !== '') || ''
    const notaRaw  = parseFloat(omdb.imdbRating)
    const nota     = (!isNaN(notaRaw) && notaRaw > 0) ? notaRaw : ''
    const poster   = omdb.PosterHD || (omdb.Poster !== 'N/A' ? omdb.Poster : '')
    const backdrop = omdb.Backdrop || ''

    setForm(f => ({
      ...f,
      titulo:   omdb.Title    || f.titulo,
      ano:      parseInt(omdb.Year) || f.ano,
      direcao:  tagsDaOMDb(omdb.Director),
      atores:   tagsDaOMDb(omdb.Actors),
      genero:   tagsDaOMDb(omdb.Genre),
      poster:   poster        || f.poster,
      backdrop: backdrop      || f.backdrop,
      imdbID:   omdb.imdbID   || f.imdbID,
      estudio:  estudio       || f.estudio,
      duracao:  duracao       || f.duracao,
      nota:     nota !== ''   ? nota : f.nota,
      origem,
    }))
    setSucesso(false)
    setErro('')
  }

  const toggleGenero = (g) =>
    set('genero', form.genero.includes(g)
      ? form.genero.filter(x => x !== g)
      : [...form.genero, g]
    )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo) return setErro('Título obrigatório.')
    setErro('')
    setLoading(true)
    try {
      await salvar({
        ...form,
        nota:    form.nota ? Math.min(10, Math.max(0, parseFloat(form.nota))) : null,
        ano:     form.ano     ? Math.min(2100, Math.max(1888, parseInt(form.ano))) : null,
        duracao: form.duracao ? Math.min(9999, Math.max(1, parseInt(form.duracao))) : null,
      }, filmeParaEditar?.id)
      setSucesso(true)
      if (!filmeParaEditar) {
        setForm({
          titulo: '', ano: '', nota: '', direcao: [], atores: [], genero: [],
          origem: 'Internacional', assistido: false, dataAssistido: '',
          poster: '', backdrop: '', imdbID: '', estudio: '', duracao: '',
          review: '', tags: [],
        })
      }
      if (onConcluir) onConcluir()
    } catch (err) {
      setErro(err.message || 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  const hasPoster = form.poster && form.poster !== 'N/A'

  const inputStyle = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0 11px',
    height: 36,
    fontSize: 13,
    color: 'var(--text-1)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.14s, box-shadow 0.14s',
  }

  const focusHandlers = {
    onFocus: e => {
      e.target.style.borderColor = 'var(--border-focus)'
      e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'
    },
    onBlur: e => {
      e.target.style.borderColor = 'var(--border)'
      e.target.style.boxShadow = 'none'
    },
  }

  return (
    <div style={inModal
      ? { padding: '24px 28px' }
      : {
          minHeight: '100vh',
          background: 'var(--bg)',
          padding: '28px 32px',
        }
    }>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 8,
          }}>
            Biblioteca Pessoal
          </p>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--text-1)',
            letterSpacing: '-0.04em',
            marginBottom: 6,
            lineHeight: 1.1,
          }}>
            {filmeParaEditar ? 'Editar' : 'Cadastrar'}{' '}
            <span style={{ color: 'var(--accent)' }}>Filme</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Busque pelo título para preencher automaticamente
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Busca em destaque */}
          <div style={{ marginBottom: 24 }}>
            <BuscaFilme onSelect={handleAutoFill} />
          </div>

          {/* Layout 2 colunas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '156px 1fr',
            gap: 22,
          }}>

            {/* ── Coluna esquerda: poster + nota ── */}
            <div className="cadastro-poster-col" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Poster */}
              <div style={{
                width: 156,
                height: 224,
                borderRadius: 20,
                overflow: 'hidden',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {hasPoster
                  ? (
                    <img
                      src={form.poster}
                      alt={form.titulo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )
                  : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      opacity: 0.3,
                    }}>
                      <i className="ti ti-ticket" style={{ fontSize: 28, color: 'var(--text-3)' }} />
                      <span style={{
                        fontSize: 9,
                        color: 'var(--text-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontWeight: 600,
                      }}>
                        Capa
                      </span>
                    </div>
                  )
                }
              </div>

              {/* URL da capa */}
              <input
                className="cadastro-poster-url"
              style={{ ...inputStyle, fontSize: 11 }}
              placeholder="URL da capa..."
                value={form.poster}
                onChange={e => set('poster', e.target.value.slice(0, 2048))}
                {...focusHandlers}
              />

              {/* Nota */}
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '18px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: 'var(--text-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Nota
                </span>
                <StarRating nota={form.nota} onChange={v => set('nota', v)} />
                <div style={{ textAlign: 'center' }}>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    style={{
                      width: 68,
                      background: 'transparent',
                      textAlign: 'center',
                      fontSize: 30,
                      fontWeight: 800,
                      color: form.nota ? 'var(--accent-rating)' : 'var(--text-4)',
                      outline: 'none',
                      border: 'none',
                      fontFamily: 'inherit',
                      letterSpacing: '-0.04em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                    placeholder="—"
                    value={form.nota}
                    onChange={e => set('nota', e.target.value)}
                  />
                  <p style={{
                    fontSize: 10,
                    color: 'var(--text-4)',
                    marginTop: 2,
                  }}>
                    de 10
                  </p>
                </div>
              </div>
            </div>

            {/* ── Coluna direita: campos ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Título + Ano */}
              <div className="cadastro-grid-2" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 90px',
                gap: 10,
              }}>
                <FieldGroup label="Título">
                  <input
                    className="input"
                    style={inputStyle}
                    placeholder="Nome do filme"
                    value={form.titulo}
                    onChange={e => set('titulo', e.target.value)}
                    required
                    {...focusHandlers}
                  />
                </FieldGroup>
                <FieldGroup label="Ano">
                  <input
                    style={inputStyle}
                    placeholder="2024"
                    value={form.ano}
                    onChange={e => set('ano', e.target.value)}
                    {...focusHandlers}
                  />
                </FieldGroup>
              </div>

              {/* Direção + Elenco */}
              <div className="cadastro-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FieldGroup label="Direção">
                  <input
                    style={inputStyle}
                    placeholder="Nome do diretor"
                    value={form.direcao.join(', ')}
                    onChange={e => set('direcao', e.target.value.split(',').map(s => s.trim()))}
                    {...focusHandlers}
                  />
                </FieldGroup>
                <FieldGroup label="Elenco">
                  <input
                    style={inputStyle}
                    placeholder="Ator 1, Ator 2..."
                    value={form.atores.join(', ')}
                    onChange={e => set('atores', e.target.value.split(',').map(s => s.trim()).slice(0, 50))}
                    {...focusHandlers}
                  />
                </FieldGroup>
              </div>

              {/* Gêneros */}
              <FieldGroup label="Gênero">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {GENEROS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenero(g)}
                      style={{
                        padding: '4px 11px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 12,
                        fontWeight: form.genero.includes(g) ? 600 : 400,
                        border: '1px solid',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        background: form.genero.includes(g) ? 'var(--accent)' : 'transparent',
                        borderColor: form.genero.includes(g) ? 'var(--accent)' : 'var(--border2)',
                        color: form.genero.includes(g) ? 'var(--btn-text)' : 'var(--text-3)',
                        transition: 'all 0.13s',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              {/* Estúdio + Duração */}
              <div className="cadastro-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FieldGroup label="Estúdio">
                  <input
                    style={inputStyle}
                    placeholder="Ex: Warner Bros."
                    value={form.estudio}
                    onChange={e => set('estudio', e.target.value)}
                    {...focusHandlers}
                  />
                </FieldGroup>
                <FieldGroup label="Duração (min)">
                  <input
                    style={inputStyle}
                    type="number"
                    placeholder="Ex: 142"
                    value={form.duracao}
                    onChange={e => set('duracao', e.target.value)}
                    {...focusHandlers}
                  />
                </FieldGroup>
              </div>

              {/* Origem + Status + Data */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: form.assistido ? '1fr 1fr 1fr' : '1fr 1fr',
                gap: 10,
              }}>
                <FieldGroup label="Origem">
                  <select
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                    value={form.origem}
                    onChange={e => set('origem', e.target.value)}
                    {...focusHandlers}
                  >
                    <option>Internacional</option>
                    <option>Nacional</option>
                  </select>
                </FieldGroup>
                <FieldGroup label="Status">
                  <select
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                    value={form.assistido ? 'sim' : 'nao'}
                    onChange={e => set('assistido', e.target.value === 'sim')}
                    {...focusHandlers}
                  >
                    <option value="nao">Pendente</option>
                    <option value="sim">Assistido</option>
                  </select>
                </FieldGroup>
                {form.assistido && (
                  <FieldGroup label="Data assistido">
                    <input
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      type="date"
                      value={form.dataAssistido}
                      onChange={e => set('dataAssistido', e.target.value)}
                      {...focusHandlers}
                    />
                  </FieldGroup>
                )}
              </div>

              {/* Divisor */}
              <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />

              {/* Tags */}
              <FieldGroup label="Tags">
                <input
                  style={inputStyle}
                  placeholder="favorito, clássico, relançamento..."
                  value={form.tags.join(', ')}
                  onChange={e => set('tags', e.target.value.split(',').map(s => s.trim()))}
                  {...focusHandlers}
                />
              </FieldGroup>

              {/* Review */}
              <FieldGroup label="Minha Review">
                <textarea
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    padding: '10px 11px',
                    resize: 'none',
                    lineHeight: 1.5,
                  }}
                  rows={3}
                  placeholder="Escreva uma opinião pessoal sobre o filme..."
                  value={form.review}
                  onChange={e => set('review', e.target.value)}
                  {...focusHandlers}
                />
              </FieldGroup>

              {/* Rodapé — botões + feedback */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingTop: 4,
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading
                    ? <><i className="ti ti-loader-2 animate-spin" /> Salvando...</>
                    : <><i className="ti ti-device-floppy" /> {filmeParaEditar ? 'Salvar alterações' : 'Salvar filme'}</>
                  }
                </button>

                {onConcluir && (
                  <button
                    type="button"
                    onClick={onConcluir}
                    className="btn-ghost"
                  >
                    Cancelar
                  </button>
                )}

                <div style={{ marginLeft: 'auto' }}>
                  {erro && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--red)',
                    }}>
                      <i className="ti ti-alert-circle" />
                      {erro}
                    </div>
                  )}
                  {sucesso && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--green)',
                    }}>
                      <i className="ti ti-circle-check" />
                      Filme salvo!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
