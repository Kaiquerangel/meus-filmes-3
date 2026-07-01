import { useAppStore } from '../store/useAppStore'

function getTimestamp(valor) {
  if (!valor) return 0
  // Firestore Timestamp tem .toDate() ou .seconds
  if (valor?.toDate) return valor.toDate().getTime()
  if (valor?.seconds) return valor.seconds * 1000
  // String ou número normal
  const d = new Date(valor)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

export function useFilters() {
  const { filmes, filtros, setFiltro, limparFiltros, sortBy, sortDir, setSort } = useAppStore()

  const filtrados = filmes.filter(f => {
    if (filtros.busca && !f.titulo?.toLowerCase().includes(filtros.busca.toLowerCase())) return false
    if (filtros.genero && !f.genero?.some(g => g.toLowerCase().includes(filtros.genero.toLowerCase()))) return false
    if (filtros.tag && !f.tags?.some(t => t.toLowerCase().includes(filtros.tag.toLowerCase()))) return false
    if (filtros.diretor && !f.direcao?.some(d => d.toLowerCase().includes(filtros.diretor.toLowerCase()))) return false
    if (filtros.ator && !f.atores?.some(a => a.toLowerCase().includes(filtros.ator.toLowerCase()))) return false
    if (filtros.notaMin != null && (f.nota || 0) < filtros.notaMin) return false
    if (filtros.notaMax != null && (f.nota || 0) > filtros.notaMax) return false

    if (filtros.periodo) {
      if (!f.dataAssistido) return false
      const dias = parseInt(filtros.periodo)
      const limite = new Date()
      limite.setDate(limite.getDate() - dias)
      if (new Date(f.dataAssistido) < limite) return false
    }

    if (filtros.dataInicio && (!f.dataAssistido || f.dataAssistido < filtros.dataInicio)) return false
    if (filtros.dataFim && (!f.dataAssistido || f.dataAssistido > filtros.dataFim)) return false
    if (filtros.anoLancamento && f.ano?.toString() !== filtros.anoLancamento.toString()) return false

    if (filtros.anoAssistido) {
      if (!f.dataAssistido || !f.dataAssistido.startsWith(filtros.anoAssistido.toString())) return false
    }

    if (filtros.origem && filtros.origem !== 'todos' && f.origem !== filtros.origem) return false

    if (filtros.status && filtros.status !== 'todos') {
      if (filtros.status === 'sim'       && !f.assistido)  return false
      if (filtros.status === 'nao'       && f.assistido)   return false
      if (filtros.status === 'favoritos' && !f.favorito)   return false
    }

    return true
  })

  const ordenados = [...filtrados].sort((a, b) => {
    let vA, vB, comparacao

    switch (sortBy) {
      case 'cadastradoEm':
        // Firestore Timestamp — usa função auxiliar
        vA = getTimestamp(a.cadastradoEm)
        vB = getTimestamp(b.cadastradoEm)
        comparacao = vA - vB
        break

      case 'dataAssistido':
        vA = a.dataAssistido ? new Date(a.dataAssistido).getTime() : 0
        vB = b.dataAssistido ? new Date(b.dataAssistido).getTime() : 0
        comparacao = vA - vB
        break

      case 'nota':
        vA = a.nota || 0
        vB = b.nota || 0
        comparacao = vA - vB
        break

      case 'ano':
        vA = a.ano || 0
        vB = b.ano || 0
        comparacao = vA - vB
        break

      case 'titulo':
        vA = a.titulo || ''
        vB = b.titulo || ''
        comparacao = String(vA).localeCompare(String(vB), 'pt-BR')
        break

      default:
        comparacao = 0
    }

    return sortDir === 'asc' ? comparacao : -comparacao
  })

  return { filtrados: ordenados, filtros, setFiltro, limparFiltros, sortBy, sortDir, setSort }
}