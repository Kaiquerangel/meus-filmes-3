import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

const GENEROS = ['Action','Adventure','Animation','Biography','Comedy','Crime','Documentary','Drama','Fantasy','Horror','Musical','Mystery','Romance','Sci-Fi','Science Fiction','Thriller','War','Western']

function sortearDaLista(filmes, generosFiltro, notaMin) {
  let lista = filmes.filter(f => f.assistido)
  if (generosFiltro.length > 0) {
    lista = lista.filter(f => f.genero?.some(g => generosFiltro.includes(g)))
  }
  if (notaMin) {
    lista = lista.filter(f => f.nota && f.nota >= notaMin)
  }
  if (!lista.length) return null
  return lista[Math.floor(Math.random() * lista.length)]
}

// Gera card visual estilo story
function CardStory({ filme, userProfile, canvasRef }) {
  const nome = userProfile?.nome || 'Alguém'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !filme) return
    const ctx = canvas.getContext('2d')
    const W = 420, H = 680
    canvas.width = W
    canvas.height = H

    // Fundo gradiente
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, 'var(--bg)')
    grad.addColorStop(1, 'var(--surface)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Pôster
    if (filme.poster && filme.poster !== 'N/A') {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Pôster centralizado
        const pw = 200, ph = 290
        const px = (W - pw) / 2, py = 120
        ctx.save()
        ctx.shadowColor = 'rgba(0,0,0,0.8)'
        ctx.shadowBlur = 40
        roundedRect(ctx, px, py, pw, ph, 16)
        ctx.clip()
        ctx.drawImage(img, px, py, pw, ph)
        ctx.restore()
        drawText(ctx, W, H, filme, nome)
      }
      img.onerror = () => drawText(ctx, W, H, filme, nome)
      img.src = filme.poster
    } else {
      drawText(ctx, W, H, filme, nome)
    }
  }, [filme])

  return null
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawText(ctx, W, H, filme, nome) {
  const centerX = W / 2

  // "indica:" tag
  ctx.fillStyle = 'rgba(201,162,39,0.15)'
  roundedRect(ctx, centerX - 80, 62, 160, 28, 14)
  ctx.fill()
  ctx.fillStyle = 'var(--accent)'
  ctx.font = '500 11px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`🎬 ${nome} indica:`, centerX, 81)

  // Título
  ctx.fillStyle = 'var(--btn-text)'
  ctx.font = 'bold 22px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'center'
  const titulo = filme.titulo || ''
  if (titulo.length > 22) {
    ctx.font = 'bold 18px -apple-system, system-ui, sans-serif'
  }
  ctx.fillText(titulo, centerX, 450)

  // Ano + origem
  ctx.fillStyle = 'var(--text-3)'
  ctx.font = '13px -apple-system, system-ui, sans-serif'
  ctx.fillText(`${filme.ano || ''} · ${filme.origem || 'Internacional'}`, centerX, 472)

  // Diretor
  if (filme.direcao?.length) {
    ctx.fillStyle = 'var(--text-4)'
    ctx.font = '12px -apple-system, system-ui, sans-serif'
    ctx.fillText(`Dir. ${filme.direcao[0]}`, centerX, 490)
  }

  // Gêneros
  if (filme.genero?.length) {
    const genres = filme.genero.slice(0, 3)
    let gx = centerX - (genres.length * 70) / 2
    genres.forEach(g => {
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      roundedRect(ctx, gx, 502, 64, 22, 11)
      ctx.fill()
      ctx.fillStyle = 'var(--text-3)'
      ctx.font = '11px -apple-system, system-ui, sans-serif'
      ctx.fillText(g, gx + 32, 517)
      gx += 70
    })
  }

  // Nota
  if (filme.nota) {
    ctx.fillStyle = 'var(--accent)'
    ctx.font = 'bold 28px -apple-system, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`★ ${filme.nota.toFixed(1)}`, centerX, 560)
    ctx.fillStyle = 'var(--border)'
    ctx.font = '11px -apple-system, system-ui, sans-serif'
    ctx.fillText('minha nota / 10', centerX, 578)
  }

  // Rodapé
  ctx.fillStyle = 'var(--surface2)'
  ctx.fillRect(0, H - 44, W, 44)
  ctx.fillStyle = 'var(--border)'
  ctx.font = '11px -apple-system, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Meus Filmes', 20, H - 17)
  ctx.textAlign = 'right'
  ctx.fillText('meus-filmes.app', W - 20, H - 17)
}

export default function ModalIndicar({ onFechar }) {
  const filmes = useAppStore(s => s.filmes)
  const userProfile = useAppStore(s => s.userProfile)

  const [etapa, setEtapa] = useState('escolha') // escolha | lista | card
  const [generosFiltro, setGenerosFiltro] = useState([])
  const [notaMin, setNotaMin] = useState(null)
  const [busca, setBusca] = useState('')
  const [filmeSelecionado, setFilmeSelecionado] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggleGenero = (g) => {
    setGenerosFiltro(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    )
  }

  const handleSortear = () => {
    const f = sortearDaLista(filmes, generosFiltro, notaMin)
    if (!f) { alert('Nenhum filme encontrado com esses filtros.'); return }
    setFilmeSelecionado(f)
    setEtapa('card')
  }

  const handleSortearOutro = () => {
    const f = sortearDaLista(filmes, generosFiltro, notaMin)
    if (!f) { alert('Nenhum outro filme encontrado.'); return }
    setFilmeSelecionado(f)
  }

  const filmesAssistidos = filmes
    .filter(f => f.assistido)
    .filter(f => busca ? f.titulo.toLowerCase().includes(busca.toLowerCase()) : true)
    .filter(f => generosFiltro.length > 0 ? f.genero?.some(g => generosFiltro.includes(g)) : true)
    .filter(f => notaMin ? f.nota && f.nota >= notaMin : true)

  const salvarImagem = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `indicacao-${filmeSelecionado?.titulo || 'filme'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const compartilharWhatsApp = () => {
    const f = filmeSelecionado
    const nome = userProfile?.nome || 'Alguém'
    const texto = `🎬 *${nome} indica:*\n\n*${f?.titulo}* (${f?.ano})\n📽️ Dir. ${f?.direcao?.[0] || 'N/A'}\n⭐ Nota: ${f?.nota?.toFixed(1) || 'N/A'}/10\n\n_via Meus Filmes_`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const copiarTexto = () => {
    const f = filmeSelecionado
    const nome = userProfile?.nome || 'Alguém'
    const texto = `🎬 ${nome} indica: ${f?.titulo} (${f?.ano}) — Nota ${f?.nota?.toFixed(1)}/10`
    navigator.clipboard.writeText(texto)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,10,11,0.92)' }}
      onClick={onFechar}
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxWidth: 480, background: 'var(--bg)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ══ ETAPA 1: ESCOLHA ══ */}
        {etapa === 'escolha' && (
          <>
            <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎬</div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>
                Indicar um Filme
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
                Filtre por gênero (opcional) e escolha como selecionar o filme.
              </p>

              {/* Filtro por gênero */}
              <div style={{ textAlign: 'left', marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Filtrar por gênero (clique para selecionar)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                  {GENEROS.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGenero(g)}
                      style={{
                        padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: 11, cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all .15s',
                        background: generosFiltro.includes(g) ? 'var(--accent-dim)' : 'transparent',
                        border: `1px solid ${generosFiltro.includes(g) ? 'var(--accent)' : 'var(--border)'}`,
                        color: generosFiltro.includes(g) ? 'var(--accent)' : 'var(--text-3)',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {generosFiltro.length > 0 && (
                  <button
                    onClick={() => setGenerosFiltro([])}
                    style={{ fontSize: 11, color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Limpar seleção
                  </button>
                )}
              </div>

              {/* Nota mínima */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <i className="ti ti-star-filled" style={{ color: 'var(--accent)', fontSize: 13 }} />
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Nota mínima:</span>
                <select
                  value={notaMin || ''}
                  onChange={e => setNotaMin(e.target.value ? parseFloat(e.target.value) : null)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-1)', fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  <option value="">Qualquer nota</option>
                  {[6, 7, 7.5, 8, 8.5, 9].map(n => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </select>
              </div>

              {/* Como escolher */}
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Como escolher?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <button
                  onClick={handleSortear}
                  style={{
                    padding: '16px 0', borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontFamily: 'inherit',
                    background: 'var(--accent-dim)', border: `1px solid var(--accent)`,
                    color: 'var(--accent)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6, transition: 'all .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                >
                  <i className="ti ti-dice" style={{ fontSize: 22 }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Sortear</span>
                </button>
                <button
                  onClick={() => setEtapa('lista')}
                  style={{
                    padding: '16px 0', borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontFamily: 'inherit',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    color: 'var(--text-2)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6, transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text-1)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                >
                  <i className="ti ti-list" style={{ fontSize: 22 }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Escolher da lista</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              <button
                onClick={onFechar}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 'var(--radius-lg)', fontSize: 13,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {/* ══ ETAPA 2: LISTA ══ */}
        {etapa === 'lista' && (
          <>
            <div style={{ padding: '20px 20px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
                Escolha um filme
              </h2>
              <input
                className="input"
                placeholder="Buscar pelo título..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ maxHeight: 380, overflowY: 'auto', scrollbarWidth: 'thin' }}>
              {filmesAssistidos.map(f => (
                <div
                  key={f.id}
                  onClick={() => { setFilmeSelecionado(f); setEtapa('card') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 20px', cursor: 'pointer', transition: 'background .1s',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 36, height: 52, flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface2)' }}>
                    {f.poster && f.poster !== 'N/A'
                      ? <img src={f.poster} alt={f.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ti ti-movie" style={{ fontSize: 14, color: 'var(--border2)' }} />
                        </div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', marginBottom: 2 }}>{f.titulo}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {f.ano} {f.genero?.slice(0, 2).join(' · ')}
                    </div>
                  </div>
                  {f.nota && (
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <i className="ti ti-star-filled" style={{ fontSize: 11 }} />
                      {f.nota.toFixed(1)}
                    </div>
                  )}
                </div>
              ))}
              {filmesAssistidos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-4)', fontSize: 13 }}>
                  Nenhum filme encontrado.
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px' }}>
              <button
                onClick={() => setEtapa('escolha')}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 'var(--radius-lg)', fontSize: 13,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Voltar
              </button>
            </div>
          </>
        )}

        {/* ══ ETAPA 3: CARD STORY ══ */}
        {etapa === 'card' && filmeSelecionado && (
          <>
            <div style={{ padding: '16px 20px 0', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
                Indicar: {filmeSelecionado.titulo}
              </h2>
            </div>

            {/* Canvas story */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
                <canvas
                  ref={canvasRef}
                  style={{ display: 'block', maxWidth: '100%', width: 280 }}
                />
                <CardStory
                  filme={filmeSelecionado}
                  userProfile={userProfile}
                  canvasRef={canvasRef}
                />
              </div>
            </div>

            {/* Botões de compartilhar */}
            <div style={{ padding: '0 20px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button
                onClick={salvarImagem}
                style={{
                  padding: '9px 0', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 500,
                  background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                  color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <i className="ti ti-download" style={{ fontSize: 13 }} /> Salvar
              </button>
              <button
                onClick={compartilharWhatsApp}
                style={{
                  padding: '9px 0', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 500,
                  background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.4)',
                  color: '#25d366', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <i className="ti ti-brand-whatsapp" style={{ fontSize: 13 }} /> WhatsApp
              </button>
              <button
                onClick={copiarTexto}
                style={{
                  padding: '9px 0', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 500,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <i className="ti ti-copy" style={{ fontSize: 13 }} /> Copiar
              </button>
            </div>

            {/* Sortear outro / Escolher outro */}
            <div style={{ padding: '0 20px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={handleSortearOutro}
                style={{
                  padding: '9px 0', borderRadius: 'var(--radius-md)', fontSize: 12,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <i className="ti ti-dice" style={{ fontSize: 13 }} /> Sortear outro
              </button>
              <button
                onClick={() => setEtapa('lista')}
                style={{
                  padding: '9px 0', borderRadius: 'var(--radius-md)', fontSize: 12,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <i className="ti ti-list" style={{ fontSize: 13 }} /> Escolher outro
              </button>
            </div>

            <div style={{ padding: '0 20px 16px' }}>
              <button
                onClick={onFechar}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 'var(--radius-lg)', fontSize: 13,
                  background: 'var(--accent)', border: 'none',
                  color: 'var(--btn-text)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                }}
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}