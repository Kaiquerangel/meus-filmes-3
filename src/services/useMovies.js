import { useEffect } from 'react'
import {
  collection, onSnapshot, orderBy, query,
  doc, addDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { useAppStore } from '../store/useAppStore'

export function useMovies() {
  const { user, setFilmes } = useAppStore()

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'users', user.uid, 'filmes'),
      orderBy('cadastradoEm', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setFilmes(lista)
    }, (err) => {
      console.error('[useMovies] Falha no listener:', err.code)
    })

    return () => unsub()
  }, [user])

  const filmes = useAppStore(s => s.filmes)

  const salvar = async (dados, id = null) => {
    const col = collection(db, 'users', user.uid, 'filmes')
    if (id) {
      // Remove campos nulos/vazios para não sobrescrever dados existentes no Firestore
      const dadosLimpos = Object.fromEntries(
        Object.entries(dados).filter(([, v]) =>
          v !== '' && v !== null && v !== undefined &&
          !(Array.isArray(v) && v.length === 0)
        )
      )
      await updateDoc(doc(col, id), dadosLimpos)
    } else {
      await addDoc(col, { ...dados, cadastradoEm: serverTimestamp() })
    }
  }

  const excluir = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'filmes', id))
  }

  const toggleAssistido = async (filme) => {
    const novoStatus = !filme.assistido
    await updateDoc(doc(db, 'users', user.uid, 'filmes', filme.id), {
      assistido: novoStatus,
      dataAssistido: novoStatus ? new Date().toISOString().slice(0, 10) : null,
    })
  }

  const toggleFavorito = async (filme) => {
    await updateDoc(doc(db, 'users', user.uid, 'filmes', filme.id), {
      favorito: !filme.favorito
    })
  }

  const reavaliar = async (filme, novaNota) => {
    // Garante que nota está no range válido
    const notaValida = Math.min(10, Math.max(0, parseFloat(novaNota) || 0))
    novaNota = notaValida
    const historico = [...(filme.historicoNotas || [])]
    if (filme.nota && filme.nota !== novaNota) {
      historico.push({
        nota: filme.nota,
        data: new Date().toISOString().slice(0, 10),
        versao: historico.length + 1,
      })
    }
    // Limita a 20 reavaliações para não inflar o documento
    const historicoLimitado = historico.slice(-20)
    await updateDoc(doc(db, 'users', user.uid, 'filmes', filme.id), {
      nota: novaNota,
      historicoNotas: historicoLimitado,
      ultimaReavaliacao: new Date().toISOString().slice(0, 10),
    })
  }

  return { filmes, salvar, excluir, toggleAssistido, toggleFavorito, reavaliar }
}