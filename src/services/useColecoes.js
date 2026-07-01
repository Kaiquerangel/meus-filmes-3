import { useEffect } from 'react'
import {
  collection, onSnapshot, query,
  doc, addDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { useAppStore } from '../store/useAppStore'

export function useColecoes() {
  const { user } = useAppStore()
  const colecoes = useAppStore(s => s.colecoes)
  const setColecoes = useAppStore(s => s.setColecoes)

  useEffect(() => {
    if (!user) return

    // Sem orderBy no Firestore — documentos antigos podem não ter criadoEm,
    // o que causaria erro silencioso e lista vazia. Ordenamos no cliente.
    const q = query(
      collection(db, 'users', user.uid, 'colecoes')
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        // Ordena no cliente: mais recente primeiro, documentos sem criadoEm ficam no fim
        .sort((a, b) => {
          const tA = a.criadoEm?.seconds ?? 0
          const tB = b.criadoEm?.seconds ?? 0
          return tB - tA
        })
      setColecoes(lista)
    }, (err) => {
      console.error('[useColecoes] Falha no listener:', err.code)
    })

    return () => unsub()
  }, [user])

  const criarColecao = async (nome, descricao = '') => {
    const nomeLimpo = nome.trim().slice(0, 100)
    if (!nomeLimpo) throw new Error('Nome da coleção não pode estar vazio.')
    await addDoc(collection(db, 'users', user.uid, 'colecoes'), {
      nome: nomeLimpo,
      descricao: descricao.trim().slice(0, 500),
      filmes: [],
      criadoEm: serverTimestamp(),
    })
  }

  const editarColecao = async (id, dados) => {
    await updateDoc(doc(db, 'users', user.uid, 'colecoes', id), dados)
  }

  const excluirColecao = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'colecoes', id))
  }

  const adicionarFilme = async (colecaoId, filmeId) => {
    const colecao = colecoes.find(c => c.id === colecaoId)
    if (!colecao) return
    // compatível com campo 'filmes' ou 'filmeIds'
    const ids = colecao.filmes || colecao.filmeIds || []
    if (ids.includes(filmeId)) return
    // Firestore docs têm limite de ~1MB; limitamos a 500 filmes por coleção
    if (ids.length >= 500) {
      console.warn('[useColecoes] Coleção atingiu o limite de 500 filmes')
      return
    }
    await updateDoc(doc(db, 'users', user.uid, 'colecoes', colecaoId), {
      filmes: [...ids, filmeId]
    })
  }

  const removerFilme = async (colecaoId, filmeId) => {
    const colecao = colecoes.find(c => c.id === colecaoId)
    if (!colecao) return
    const ids = colecao.filmes || colecao.filmeIds || []
    await updateDoc(doc(db, 'users', user.uid, 'colecoes', colecaoId), {
      filmes: ids.filter(id => id !== filmeId)
    })
  }

  return { colecoes, criarColecao, editarColecao, excluirColecao, adicionarFilme, removerFilme }
}