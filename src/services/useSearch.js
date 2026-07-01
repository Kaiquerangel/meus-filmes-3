import { useState } from 'react'
import { OMDB_KEY, TMDB_KEY } from './env'

const TMDB_BASE = 'https://api.themoviedb.org/3'

async function buscaTMDB(titulo) {
  try {
    const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(titulo)}&language=pt-BR&include_adult=false`)
    const data = await res.json()
    if (!data.results?.length) return []

    const top = data.results.slice(0, 8)
    const comImdb = await Promise.all(top.map(async (filme) => {
      try {
        const det = await fetch(`${TMDB_BASE}/movie/${filme.id}?api_key=${TMDB_KEY}`)
        const detData = await det.json()
        return {
          imdbID: detData.imdb_id,
          Title: filme.title,
          Year: filme.release_date?.slice(0, 4) || 'N/A',
          Poster: filme.poster_path ? `https://image.tmdb.org/t/p/w92${filme.poster_path}` : 'N/A',
        }
      } catch {
        return null
      }
    }))

    return comImdb.filter(f => f?.imdbID?.startsWith('tt'))
  } catch {
    return []
  }
}

async function buscaOMDb(titulo) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(titulo)}&type=movie&apikey=${OMDB_KEY}`)
    const data = await res.json()
    return data.Response !== 'False' ? (data.Search || []).slice(0, 8) : []
  } catch {
    return []
  }
}

export async function buscarDetalhes(imdbId) {
  // Busca dados OMDB
  const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}`)
  const data = await res.json()
  if (data.Response === 'False') throw new Error('Filme não encontrado.')

  // Busca backdrop e poster HD via TMDB (se tiver chave)
  if (TMDB_KEY) {
    try {
      const tmdbRes = await fetch(
        `${TMDB_BASE}/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id`
      )
      const tmdbData = await tmdbRes.json()
      const tmdbFilme = tmdbData.movie_results?.[0]

      if (tmdbFilme) {
        // Backdrop (imagem horizontal da cena)
        if (tmdbFilme.backdrop_path) {
          data.Backdrop = `https://image.tmdb.org/t/p/w1280${tmdbFilme.backdrop_path}`
        }
        // Poster HD (w500 em vez do w92 do autocomplete)
        if (tmdbFilme.poster_path) {
          data.PosterHD = `https://image.tmdb.org/t/p/w500${tmdbFilme.poster_path}`
        }
      }
    } catch {
      // Falhou silenciosamente — OMDB já tem o básico
    }
  }

  return data
}

export function useSearch() {
  const [sugestoes, setSugestoes] = useState([])
  const [buscando, setBuscando] = useState(false)

  const buscar = async (titulo) => {
    if (!titulo || titulo.length < 2) { setSugestoes([]); return }
    setBuscando(true)
    try {
      const [tmdb, omdb] = await Promise.allSettled([buscaTMDB(titulo), buscaOMDb(titulo)])
      const resTMDB = tmdb.status === 'fulfilled' ? tmdb.value : []
      const resOMDb = omdb.status === 'fulfilled' ? omdb.value : []

      const vistos = new Set(resTMDB.map(f => f.imdbID))
      const merged = [...resTMDB, ...resOMDb.filter(f => !vistos.has(f.imdbID))].slice(0, 8)
      setSugestoes(merged)
    } finally {
      setBuscando(false)
    }
  }

  const limpar = () => setSugestoes([])

  return { sugestoes, buscando, buscar, limpar }
}