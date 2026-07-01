import { useState, useEffect, useRef } from 'react'
import { TMDB_KEY, YOUTUBE_KEY } from '../services/env'

async function buscarSinopse(titulo, ano) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(titulo)}&year=${ano}&language=pt-BR`
    )
    const data = await res.json()
    return data.results?.[0]?.overview || null
  } catch { return null }
}

async function buscarTrailer(titulo, ano) {
  try {
    if (!YOUTUBE_KEY) return null
    const q = encodeURIComponent(`${titulo} ${ano} trailer oficial`)
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${q}&type=video&key=${YOUTUBE_KEY}`
    )
    const data = await res.json()
    return data.items?.[0]?.id?.videoId || null
  } catch { return null }
}

function sortearFilme(filmes) {
  const pendentes = filmes.filter(f => !f.assistido)
  if (!pendentes.length) return null
  return pendentes[Math.floor(Math.random() * pendentes.length)]
}

export default function ModalSugerir({ filmes, onFechar, onMarcarAssistido }) {
  const [filme, setFilme]               = useState(null)
  const [trailer, setTrailer]           = useState(null)
  const [sinopse, setSinopse]           = useState(null)
  const [loadingTrailer, setLoadingTrailer] = useState(false)
  const [loadingSinopse, setLoadingSinopse] = useState(false)

  // Token de geração — incrementado a cada sortear().
  // Promises antigas checam se o token ainda é o mesmo antes de setar estado.
  // Se mudou, o resultado é descartado silenciosamente.
  const geracaoRef = useRef(0)

  const sortear = () => {
    const f = sortearFilme(filmes)

    // Incrementa o token ANTES de qualquer setState
    const geracao = ++geracaoRef.current

    setFilme(f)
    setTrailer(null)
    setSinopse(null)

    if (!f) return

    setLoadingTrailer(true)
    setLoadingSinopse(true)

    buscarSinopse(f.titulo, f.ano).then(s => {
      // Só aplica se ainda somos a geração atual
      if (geracaoRef.current !== geracao) return
      setSinopse(s)
      setLoadingSinopse(false)
    })

    buscarTrailer(f.titulo, f.ano).then(v => {
      if (geracaoRef.current !== geracao) return
      setTrailer(v)
      setLoadingTrailer(false)
    })
  }

  useEffect(() => { sortear() }, [])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onFechar])

  if (!filme) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(10,10,11,0.92)' }}
        onClick={onFechar}
      >
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--surface)', maxWidth: 400, width: '90%' }}
          onClick={e => e.stopPropagation()}
        >
          <i className="ti ti-movie-off" style={{ fontSize: 40, color: 'var(--border2)', display: 'block', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Nenhum filme pendente para sugerir!</p>
          <p style={{ color: 'var(--text-4)', fontSize: 12, marginTop: 6 }}>Adicione filmes à sua lista primeiro.</p>
          <button onClick={onFechar} className="btn-gold" style={{ marginTop: 20, width: 'auto', padding: '8px 24px' }}>
            Fechar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,10,11,0.92)' }}
      onClick={onFechar}
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
        style={{
          maxWidth: 500,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Fundo blur pôster */}
        {filme.poster && filme.poster !== 'N/A' && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${filme.poster})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(30px) brightness(0.15) saturate(1.5)',
              transform: 'scale(1.1)',
            }}
          />
        )}

        {/* Header */}
        <div
          className="relative flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>
            Que tal assistir...
          </h2>
          <button
            onClick={onFechar}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-2)',
            }}
          >
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="relative overflow-y-auto" style={{ flex: 1, scrollbarWidth: 'thin' }}>
          <div style={{ padding: 20 }}>

            {/* Pôster + Info */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flexShrink: 0 }}>
                {filme.poster && filme.poster !== 'N/A'
                  ? (
                    <img
                      src={filme.poster}
                      alt={filme.titulo}
                      style={{
                        width: 110, height: 158,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 110, height: 158,
                      background: 'var(--surface2)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="ti ti-movie" style={{ fontSize: 32, color: 'var(--border2)' }} />
                    </div>
                  )
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontSize: 18, fontWeight: 700,
                  color: 'var(--text-1)',
                  letterSpacing: '-.4px',
                  lineHeight: 1.2,
                  marginBottom: 10,
                }}>
                  {filme.titulo}
                </h3>

                {filme.nota && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <i className="ti ti-star-filled" style={{ color: 'var(--accent-rating)', fontSize: 18 }} />
                    <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-rating)', letterSpacing: '-.5px' }}>
                      {filme.nota.toFixed(1)}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                  {filme.ano && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <i className="ti ti-calendar" style={{ color: 'var(--accent)', fontSize: 12 }} />
                      <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>Ano: {filme.ano}</span>
                    </div>
                  )}
                  {filme.direcao?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <i className="ti ti-video" style={{ color: 'var(--accent)', fontSize: 12 }} />
                      <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>
                        Direção: {filme.direcao.join(', ')}
                      </span>
                    </div>
                  )}
                  {filme.atores?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <i className="ti ti-users" style={{ color: 'var(--accent)', fontSize: 12 }} />
                      <span style={{ color: 'var(--text-2)' }}>
                        {filme.atores.slice(0, 3).join(', ')}{filme.atores.length > 3 ? '...' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {filme.genero?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {filme.genero.map(g => (
                      <span
                        key={g}
                        style={{
                          fontSize: 11, padding: '3px 9px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'var(--accent-dim)',
                          color: 'var(--accent)',
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sinopse */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: 'var(--text-4)',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                marginBottom: 6,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <i className="ti ti-align-left" style={{ color: 'var(--accent)', fontSize: 11 }} />
                Sinopse
              </div>

              {loadingSinopse ? (
                <div style={{
                  height: 60,
                  background: 'var(--surface2)',
                  borderRadius: 'var(--radius-md)',
                  animation: 'pulse 1.5s infinite',
                }} />
              ) : sinopse ? (
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{sinopse}</p>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-4)', fontStyle: 'italic' }}>
                  Sinopse não disponível.
                </p>
              )}
            </div>

            {/* Trailer */}
            {loadingTrailer && (
              <div style={{
                width: '100%', aspectRatio: '16/9',
                background: 'var(--surface2)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <i className="ti ti-loader-2 animate-spin" style={{ fontSize: 24, color: 'var(--text-4)' }} />
              </div>
            )}

            {!loadingTrailer && trailer && (
              <div style={{
                width: '100%', aspectRatio: '16/9',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                marginBottom: 16,
              }}>
                <iframe
                  key={trailer}
                  src={`https://www.youtube.com/embed/${trailer}`}
                  title={`Trailer — ${filme.titulo}`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative flex-shrink-0"
          style={{
            display: 'flex', gap: 8,
            padding: '12px 20px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={onFechar}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 'var(--radius-lg)',
              fontSize: 13, fontWeight: 500,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.14s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            Ótima ideia!
          </button>

          <button
            onClick={() => { onMarcarAssistido(filme); onFechar() }}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 'var(--radius-lg)',
              fontSize: 13, fontWeight: 600,
              background: 'var(--accent)',
              border: 'none',
              color: 'var(--btn-text)',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <i className="ti ti-check" /> Marcar assistido
          </button>

          <button
            onClick={sortear}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 'var(--radius-lg)',
              fontSize: 13, fontWeight: 500,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.14s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            Sugerir outro
          </button>
        </div>
      </div>
    </div>
  )
}
