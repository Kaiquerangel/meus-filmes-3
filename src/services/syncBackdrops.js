import { TMDB_KEY } from './env'
import { doc, updateDoc, collection } from 'firebase/firestore'
import { db } from './firebase'

async function buscarBackdropTMDB(imdbID, titulo, ano) {
  try {
    // Se tem imdbID, busca direto pelo ID para maior precisão
    if (imdbID) {
      const res = await fetch(
        `https://api.themoviedb.org/3/find/${imdbID}?api_key=${TMDB_KEY}&external_source=imdb_id`
      )
      const data = await res.json()
      const filme = data.movie_results?.[0]
      if (filme?.backdrop_path) {
        return {
          backdrop: `https://image.tmdb.org/t/p/w1280${filme.backdrop_path}`,
          posterHD: filme.poster_path ? `https://image.tmdb.org/t/p/w500${filme.poster_path}` : null,
        }
      }
    }

    // Fallback: busca por título
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(titulo)}&language=pt-BR${ano ? `&year=${ano}` : ''}`
    )
    const data = await res.json()
    const filme = data.results?.[0]
    if (filme?.backdrop_path) {
      return {
        backdrop: `https://image.tmdb.org/t/p/w1280${filme.backdrop_path}`,
        posterHD: filme.poster_path ? `https://image.tmdb.org/t/p/w500${filme.poster_path}` : null,
      }
    }
    return null
  } catch {
    return null
  }
}

export async function sincronizarBackdrops(uid, filmes, onProgress) {
  // Busca filmes sem backdrop
  const semBackdrop = filmes.filter(f => !f.backdrop || f.backdrop === '')
  let atualizados = 0
  let erros = 0

  for (let i = 0; i < semBackdrop.length; i++) {
    const filme = semBackdrop[i]
    onProgress?.({ atual: i + 1, total: semBackdrop.length, titulo: filme.titulo })

    try {
      const resultado = await buscarBackdropTMDB(filme.imdbID, filme.titulo, filme.ano)

      if (resultado?.backdrop) {
        const update = { backdrop: resultado.backdrop }
        // Atualiza poster HD se o atual for de baixa qualidade (tamanho w92)
        if (resultado.posterHD && filme.poster?.includes('/w92')) {
          update.poster = resultado.posterHD
        }
        await updateDoc(doc(collection(db, 'users', uid, 'filmes'), filme.id), update)
        atualizados++
      }
    } catch {
      erros++
    }

    // Delay para não sobrecarregar a API
    await new Promise(r => setTimeout(r, 300))
  }

  return { atualizados, erros, total: semBackdrop.length }
}
