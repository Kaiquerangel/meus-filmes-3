import { create } from 'zustand'

function getTema() {
  try { return localStorage.getItem('kra-tema') || 'gold' } catch { return 'gold' }
}

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema)
}

export const useAppStore = create((set) => ({
  user: null,
  userProfile: null,
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),

  carregando: true,
  setCarregando: (carregando) => set({ carregando }),

  filmes: [],
  setFilmes: (filmes) => set({ filmes }),
  addFilme: (filme) => set((s) => ({ filmes: [filme, ...s.filmes] })),
  updateFilme: (id, dados) => set((s) => ({
    filmes: s.filmes.map((f) => f.id === id ? { ...f, ...dados } : f)
  })),
  removeFilme: (id) => set((s) => ({
    filmes: s.filmes.filter((f) => f.id !== id)
  })),

  colecoes: [],
  setColecoes: (colecoes) => set({ colecoes }),

  filtros: {
    busca: '',
    genero: '',
    tag: '',
    diretor: '',
    ator: '',
    status: 'todos',
    origem: 'todos',
    notaMin: null,
    notaMax: null,
    periodo: '',
    dataInicio: '',
    dataFim: '',
    anoLancamento: '',
    anoAssistido: '',
  },
  setFiltro: (chave, valor) => set((s) => ({
    filtros: { ...s.filtros, [chave]: valor }
  })),
  limparFiltros: () => set({
    filtros: {
      busca: '', genero: '', tag: '', diretor: '', ator: '',
      status: 'todos', origem: 'todos',
      notaMin: null, notaMax: null,
      periodo: '', dataInicio: '', dataFim: '',
      anoLancamento: '', anoAssistido: '',
    }
  }),

  // Padrão: mais antigo cadastrado primeiro
  sortBy: 'cadastradoEm',
  sortDir: 'asc',
  setSort: (sortBy, sortDir) => set({ sortBy, sortDir }),

  viewMode: 'cards',
  setViewMode: (viewMode) => set({ viewMode }),

  sidebarExpanded: false,
  setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),

  tema: getTema(),
  setTema: (tema) => {
    try { localStorage.setItem('kra-tema', tema) } catch {}
    aplicarTema(tema)
    set({ tema })
  },
}))