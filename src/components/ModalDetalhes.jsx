import { useState, useEffect } from 'react'
import { TMDB_KEY } from '../services/env'

async function buscarSinopse(titulo, ano) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(titulo)}&year=${ano}&language=pt-BR`
    )
    const data = await res.json()
    return data.results?.[0]?.overview || null
  } catch {
    return null
  }
}

async function buscarTrailer(titulo, ano) {
  try {
    const YOUTUBE_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
    if (!YOUTUBE_KEY) return null
    const q = encodeURIComponent(`${titulo} ${ano} trailer oficial`)
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${q}&type=video&key=${YOUTUBE_KEY}`
    )
    const data = await res.json()
    return data.items?.[0]?.id?.videoId || null
  } catch {
    return null
  }
}

export default function ModalDetalhes({ filme, onFechar, onEditar, onToggleFavorito, onToggleAssistido, onReavaliar }) {
  const [sinopse, setSinopse] = useState('')
  const [trailer, setTrailer] = useState(null)
  const [loadingSinopse, setLoadingSinopse] = useState(true)
  const [loadingTrailer, setLoadingTrailer] = useState(true)
  const [novaNota, setNovaNota] = useState(filme.nota || '')
  const [modoReavaliar, setModoReavaliar] = useState(false)
  const [isFavorito, setIsFavorito] = useState(filme.favorito || false)

  const handleToggleFavorito = () => {
    setIsFavorito(v => !v)
    onToggleFavorito(filme)
  }

  useEffect(() => {
    if (!filme) return
    setLoadingSinopse(true)
    setLoadingTrailer(true)
    buscarSinopse(filme.titulo, filme.ano).then(s => {
      setSinopse(s || filme.sinopse || 'Sinopse não disponível.')
      setLoadingSinopse(false)
    })
    buscarTrailer(filme.titulo, filme.ano).then(v => {
      setTrailer(v)
      setLoadingTrailer(false)
    })
  }, [filme?.id])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!filme) return null

  const handleReavaliar = () => {
    if (!novaNota || isNaN(novaNota)) return
    onReavaliar(filme, parseFloat(novaNota))
    setModoReavaliar(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ background: 'rgba(10,10,11,0.92)' }}
      onClick={onFechar}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl modal-detalhes"
        style={{ background: 'var(--bg)', border: '0.5px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >

        {/* Fundo blur pôster */}
        {filme.poster && filme.poster !== 'N/A' && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${filme.poster})`,
              opacity: .06,
              filter: 'blur(20px)',
            }}
          />
        )}

        {/* Header */}
        <div
          className="relative flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2
            className="font-semibold text-base truncate pr-4"
            style={{ color: 'var(--text-1)', letterSpacing: '-.3px' }}
          >
            {filme.titulo}
          </h2>
          <button
            onClick={onFechar}
            className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <i className="ti ti-x text-sm" />
          </button>
        </div>

        {/* Corpo */}
        <div className="relative overflow-y-auto" style={{ maxHeight: '75vh', scrollbarWidth: 'thin' }}>

          {/* Seção principal */}
          <div className="flex gap-4 p-5 modal-detalhes-section">

            {/* Pôster */}
            {filme.poster && filme.poster !== 'N/A' && (
              <img
                src={filme.poster}
                alt={filme.titulo}
                className="w-28 h-40 object-cover rounded-xl flex-shrink-0 shadow-xl modal-detalhes-poster"
                style={{ border: '0.5px solid var(--border)' }}
              />
            )}

            {/* Infos */}
            <div className="flex-1 min-w-0">

              {/* Nota + favorito */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  {filme.nota
                    ? (
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-4xl font-bold"
                          style={{ color: 'var(--accent-rating)', letterSpacing: '-.5px' }}
                        >
                          {filme.nota.toFixed(1)}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-4)' }}>/10</span>
                      </div>
                    )
                    : <span className="text-sm" style={{ color: 'var(--text-4)' }}>Sem nota</span>
                  }
                </div>
                <button
                  onClick={handleToggleFavorito}
                  style={{ background: 'none', border: 'none', outline: 'none', cursor: 'pointer', padding: 4, fontSize: 22, lineHeight: 1, color: isFavorito ? 'var(--accent-rating)' : 'var(--text-4)', transition: 'color .15s' }}
                >
                  {isFavorito ? '★' : '☆'}
                </button>
              </div>

              {/* Gêneros */}
              {filme.genero?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {filme.genero.map(g => (
                    <span
                      key={g}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: 'var(--accent-dim)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Detalhes */}
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <i className="ti ti-calendar text-xs w-3" style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--text-3)' }}>Ano:</span>
                  <span style={{ color: 'var(--text-1)' }}>{filme.ano || '—'}</span>
                </div>
                {filme.direcao?.length > 0 && (
                  <div className="flex items-start gap-2">
                    <i className="ti ti-video text-xs w-3 mt-0.5" style={{ color: 'var(--accent)' }} />
                    <span style={{ color: 'var(--text-3)' }} className="flex-shrink-0">Direção:</span>
                    <span style={{ color: 'var(--text-1)' }}>{filme.direcao.join(', ')}</span>
                  </div>
                )}
                {filme.atores?.length > 0 && (
                  <div className="flex items-start gap-2">
                    <i className="ti ti-users text-xs w-3 mt-0.5" style={{ color: 'var(--accent)' }} />
                    <span style={{ color: 'var(--text-3)' }} className="flex-shrink-0">Artistas:</span>
                    <span style={{ color: 'var(--text-1)' }} className="line-clamp-2">{filme.atores.join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <i className="ti ti-eye text-xs w-3" style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--text-3)' }}>Status:</span>
                  {filme.assistido
                    ? <span className="text-xs flex items-center gap-1" style={{ color: 'var(--green)' }}>
                        <i className="ti ti-check text-[10px]" />
                        em {filme.dataAssistido || '—'}
                      </span>
                    : <span className="text-xs" style={{ color: 'var(--yellow)' }}>Pendente</span>
                  }
                </div>
                {filme.plataforma && (
                  <div className="flex items-center gap-2">
                    <i className="ti ti-device-tv text-xs w-3" style={{ color: 'var(--accent)' }} />
                    <span style={{ color: 'var(--text-3)' }}>Plataforma:</span>
                    <span style={{ color: 'var(--text-1)' }}>{filme.plataforma}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sinopse */}
          <div className="px-5 pb-4">
            <div
              className="text-[10px] uppercase font-medium mb-2 flex items-center gap-2"
              style={{ color: 'var(--text-4)', letterSpacing: '.08em' }}
            >
              <i className="ti ti-align-left" style={{ color: 'var(--accent)' }} /> Sinopse
            </div>
            {loadingSinopse
              ? <div className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--surface2)' }} />
              : <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{sinopse}</p>
            }
          </div>

          {/* Review pessoal */}
          {filme.review && (
            <div className="px-5 pb-4">
              <div
                className="text-[10px] uppercase font-medium mb-2 flex items-center gap-2"
                style={{ color: 'var(--text-4)', letterSpacing: '.08em' }}
              >
                <i className="ti ti-message" style={{ color: 'var(--accent)' }} /> Minha review
              </div>
              <p className="text-xs leading-relaxed italic" style={{ color: 'var(--text-3)' }}>
                "{filme.review}"
              </p>
            </div>
          )}

          {/* Reavaliar */}
          {modoReavaliar && (
            <div
              className="mx-5 mb-4 p-3 rounded-xl"
              style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
            >
              <div
                className="text-[10px] uppercase font-medium mb-2"
                style={{ color: 'var(--text-4)', letterSpacing: '.08em' }}
              >
                Nova nota
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0" max="10" step="0.1"
                  value={novaNota}
                  onChange={e => setNovaNota(e.target.value)}
                  className="input flex-1 text-center text-lg font-semibold"
                  style={{ color: 'var(--accent-rating)' }}
                  placeholder="0 – 10"
                  autoFocus
                />
                <button
                  onClick={handleReavaliar}
                  className="px-4 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: 'var(--accent)', color: 'var(--btn-text)', border: 'none', cursor: 'pointer' }}
                >
                  Salvar
                </button>
                <button
                  onClick={() => setModoReavaliar(false)}
                  className="px-3 rounded-lg text-sm transition-all"
                  style={{ background: 'var(--surface2)', color: 'var(--text-3)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
            </div>
          )}

          {/* Trailer */}
          <div className="px-5 pb-5">
            <div
              className="text-[10px] uppercase font-medium mb-2 flex items-center gap-2"
              style={{ color: 'var(--text-4)', letterSpacing: '.08em' }}
            >
              <i className="ti ti-brand-youtube" style={{ color: 'var(--accent)' }} /> Trailer
            </div>
            {loadingTrailer
              ? <div className="w-full aspect-video rounded-xl animate-pulse" style={{ background: 'var(--surface2)' }} />
              : trailer
                ? <div className="w-full aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer}`}
                      title="Trailer"
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                : <div
                    className="w-full aspect-video rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
                  >
                    <div className="text-center">
                      <i className="ti ti-video-off text-2xl block mb-1" style={{ color: 'var(--border2)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-4)' }}>Trailer não encontrado</span>
                    </div>
                  </div>
            }
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative flex gap-2 px-5 py-4 modal-footer"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <button
            onClick={() => setModoReavaliar(v => !v)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            <i className="ti ti-star text-xs" /> Reavaliar
          </button>
          <button
            onClick={() => onEditar(filme)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            <i className="ti ti-edit text-xs" /> Editar
          </button>
          <button
            onClick={() => { onToggleAssistido(filme); onFechar() }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-all"
            style={{
              background: filme.assistido ? 'rgba(255,69,58,0.1)' : 'rgba(50,215,75,0.1)',
              color: filme.assistido ? 'var(--red)' : 'var(--green)',
              border: `1px solid ${filme.assistido ? 'rgba(255,69,58,0.2)' : 'rgba(50,215,75,0.2)'}`,
              cursor: 'pointer',
            }}
          >
            <i className={`ti ${filme.assistido ? 'ti-eye-off' : 'ti-eye'} text-xs`} />
            {filme.assistido ? 'Desmarcar' : 'Assistido'}
          </button>
          <button
            onClick={onFechar}
            className="px-4 py-2 text-xs rounded-lg transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--text-3)', border: '1px solid var(--border)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}