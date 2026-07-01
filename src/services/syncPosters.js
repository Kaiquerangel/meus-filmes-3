import { TMDB_KEY, OMDB_KEY } from './env'
import { doc, updateDoc, collection } from 'firebase/firestore'
import { db } from './firebase'

async function buscarPosterTMDB(titulo, ano) {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(titulo)}&language=pt-BR${ano ? `&year=${ano}` : ''}`
    const res = await fetch(url)
    const data = await res.json()
    const primeiro = data.results?.[0]
    if (primeiro?.poster_path) {
      return `https://image.tmdb.org/t/p/w300${primeiro.poster_path}`
    }
    return null
  } catch { return null }
}

async function buscarPosterOMDB(titulo, ano) {
  try {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(titulo)}&apikey=${OMDB_KEY}${ano ? `&y=${ano}` : ''}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
      return data.Poster
    }
    return null
  } catch { return null }
}

export async function sincronizarPosters(uid, filmes, onProgress) {
  const semPoster = filmes.filter(f => !f.poster || f.poster === 'N/A' || f.poster === '')
  let atualizados = 0
  let erros = 0

  for (let i = 0; i < semPoster.length; i++) {
    const filme = semPoster[i]
    onProgress?.({ atual: i + 1, total: semPoster.length, titulo: filme.titulo })

    try {
      // Tenta TMDB primeiro (melhor qualidade)
      let poster = await buscarPosterTMDB(filme.titulo, filme.ano)

      // Fallback para OMDB
      if (!poster) {
        poster = await buscarPosterOMDB(filme.titulo, filme.ano)
      }

      if (poster) {
        await updateDoc(doc(collection(db, 'users', uid, 'filmes'), filme.id), { poster })
        atualizados++
      }
    } catch {
      erros++
    }

    // Pequeno delay para não sobrecarregar as APIs
    await new Promise(r => setTimeout(r, 300))
  }

  return { atualizados, erros, semPoster: semPoster.length }
}