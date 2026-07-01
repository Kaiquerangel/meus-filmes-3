import { useMemo, useState, useCallback } from 'react'
import { useMovies } from '../services/useMovies'
import HeroBanner from '../components/HeroBanner'
import PosterRow from '../components/PosterRow'
import ModalDetalhes from '../components/ModalDetalhes'
import ModalEdicao from '../components/ModalEdicao'

// Shuffle determinístico com seed customizável
function shuffle(arr, seed) {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Seed base: muda a cada hora (não mais a cada dia)
function seedHora() {
  return Math.floor(Date.now() / 3600000)
}

export default function Home() {
  const { filmes, toggleFavorito, toggleAssistido, reavaliar } = useMovies()
  const [filmeDetalhes, setFilmeDetalhes] = useState(null)
  const [filmeEditar, setFilmeEditar]     = useState(null)

  // Contadores de refresh independentes por seção
  const [seedDestaques,    setSeedDestaques]    = useState(seedHora())
  const [seedRecomendados, setSeedRecomendados] = useState(seedHora() + 1)

  const atualizarDestaques    = useCallback(() => setSeedDestaques(s => s + 1000), [])
  const atualizarRecomendados = useCallback(() => setSeedRecomendados(s => s + 1000), [])

  // ── DESTAQUES ──
  // Pool: top 60 por nota + favoritos + assistidos nos últimos 90 dias
  // Muito mais variado que o top40 fixo anterior
  const destaques = useMemo(() => {
    const assistidos = filmes.filter(f => f.assistido && f.nota)
    if (!assistidos.length) return []

    const hoje     = Date.now()
    const recentes = assistidos.filter(f => {
      if (!f.dataAssistido) return false
      return (hoje - new Date(f.dataAssistido).getTime()) < 90 * 86400000
    })
    const favoritos = assistidos.filter(f => f.favorito)
    const top60     = [...assistidos].sort((a, b) => b.nota - a.nota).slice(0, 60)

    // União sem duplicatas, priorizando recentes e favoritos no pool
    const pool = [...new Map(
      [...recentes, ...favoritos, ...top60].map(f => [f.id, f])
    ).values()]

    return shuffle(pool, seedDestaques).slice(0, 12)
  }, [filmes, seedDestaques])

  // ── RECOMENDADOS ──
  // Pool: top 40 candidatos pendentes por score de gênero
  // Seed separada para variar independentemente dos destaques
  const { recomendados, topGeneros } = useMemo(() => {
    const assistidos = filmes.filter(f => f.assistido)
    const pendentes  = filmes.filter(f => !f.assistido)
    if (!pendentes.length) return { recomendados: [], topGeneros: [] }

    const freq = {}
    assistidos.forEach(f => (f.genero || []).forEach(g => { freq[g] = (freq[g] || 0) + 1 }))

    const topGeneros = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g)

    if (!Object.keys(freq).length) {
      return {
        recomendados: shuffle(
          [...pendentes].sort((a, b) => (b.nota || 0) - (a.nota || 0)),
          seedRecomendados
        ).slice(0, 12),
        topGeneros: [],
      }
    }

    const comScore = pendentes.map(f => ({
      ...f,
      _score: (f.genero || []).reduce((acc, g) => acc + (freq[g] || 0), 0) + (f.nota || 0) * 0.5,
    }))

    // Pool maior (40 candidatos) para mais variação ao atualizar
    const pool40 = comScore.sort((a, b) => b._score - a._score).slice(0, 40)

    return {
      recomendados: shuffle(pool40, seedRecomendados).slice(0, 12),
      topGeneros,
    }
  }, [filmes, seedRecomendados])

  // ── RECENTES ── (determinístico — sempre os últimos assistidos)
  const recentes = useMemo(() =>
    [...filmes]
      .filter(f => f.assistido && f.dataAssistido)
      .sort((a, b) => b.dataAssistido.localeCompare(a.dataAssistido))
      .slice(0, 10)
  , [filmes])

  if (!filmes.length) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', textAlign: 'center', padding: '0 24px',
      }}>
        <i className="ti ti-movie" style={{ fontSize: 48, color: 'var(--border2)', marginBottom: 16 }} />
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>Sua coleção está vazia.</p>
        <a href="/cadastro" className="btn-primary" style={{ textDecoration: 'none' }}>
          <i className="ti ti-plus" /> Cadastrar primeiro filme
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 40 }}>

      <HeroBanner filmes={filmes} onVerDetalhes={setFilmeDetalhes} />

      <div style={{ marginTop: 8 }}>

        <PosterRow
          titulo="Destaques do dia"
          icone="ti-trophy"
          filmes={destaques}
          subtitulo="Mix de top avaliados, favoritos e assistidos recentemente"
          onVerDetalhes={setFilmeDetalhes}
          onAtualizar={atualizarDestaques}
        />

        {recomendados.length > 0 && (
          <PosterRow
            titulo="Recomendados para você"
            icone="ti-sparkles"
            filmes={recomendados}
            subtitulo={topGeneros.length ? `Baseado em ${topGeneros.join(', ')}` : 'Filmes pendentes'}
            onVerDetalhes={setFilmeDetalhes}
            onAtualizar={atualizarRecomendados}
          />
        )}

        {recentes.length > 0 && (
          <PosterRow
            titulo="Assistidos Recentemente"
            icone="ti-clock"
            filmes={recentes}
            tamanho="lg"
            onVerDetalhes={setFilmeDetalhes}
          />
        )}

        {filmeDetalhes && (
          <ModalDetalhes
            filme={filmeDetalhes}
            onFechar={() => setFilmeDetalhes(null)}
            onEditar={(f) => { setFilmeDetalhes(null); setFilmeEditar(f) }}
            onToggleFavorito={(f) => { toggleFavorito(f); setFilmeDetalhes(prev => prev ? { ...prev, favorito: !prev.favorito } : null) }}
            onToggleAssistido={(f) => { toggleAssistido(f); setFilmeDetalhes(null) }}
            onReavaliar={(f, nota) => { reavaliar(f, nota); setFilmeDetalhes(prev => prev ? { ...prev, nota } : null) }}
          />
        )}

        {filmeEditar && (
          <ModalEdicao filme={filmeEditar} onFechar={() => setFilmeEditar(null)} />
        )}
      </div>
    </div>
  )
}