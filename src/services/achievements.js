import { calcStreak } from '../utils'

export const CONQUISTAS = [
  {
    id: 'cinefilo_10', nome: 'Cinéfilo Iniciante', descricao: '10 filmes cadastrados.',
    icone: 'ti-film', target: 10,
    progress: (l) => Math.min(l.length, 10),
    check: (l) => l.length >= 10,
  },
  {
    id: 'cinefilo_50', nome: 'Colecionador', descricao: '50 filmes cadastrados.',
    icone: 'ti-layer-group', target: 50,
    progress: (l) => Math.min(l.length, 50),
    check: (l) => l.length >= 50,
  },
  {
    id: 'cinefilo_100', nome: 'Centenário', descricao: '100 filmes cadastrados.',
    icone: 'ti-trophy', target: 100,
    progress: (l) => Math.min(l.length, 100),
    check: (l) => l.length >= 100,
  },
  {
    id: 'cinefilo_200', nome: 'Arquivo Vivo', descricao: '200 filmes cadastrados.',
    icone: 'ti-database', target: 200,
    progress: (l) => Math.min(l.length, 200),
    check: (l) => l.length >= 200,
  },
  {
    id: 'critico_10', nome: 'Crítico Exigente', descricao: 'Deu nota 10 para algum filme.',
    icone: 'ti-star', target: 1,
    progress: (l) => l.filter(f => f.nota === 10).length,
    check: (l) => l.some(f => f.nota === 10),
  },
  {
    id: 'critico_severo', nome: 'Crítico Severo', descricao: 'Deu nota abaixo de 5.',
    icone: 'ti-thumb-down', target: 1,
    progress: (l) => l.filter(f => f.nota > 0 && f.nota < 5).length,
    check: (l) => l.some(f => f.nota > 0 && f.nota < 5),
  },
  {
    id: 'nacional_5', nome: 'Patriota', descricao: '10 filmes nacionais assistidos.',
    icone: 'ti-flag', target: 10,
    progress: (l) => l.filter(f => f.origem === 'Nacional' && f.assistido).length,
    check: (l) => l.filter(f => f.origem === 'Nacional' && f.assistido).length >= 10,
  },
  {
    id: 'fa_carteirinha', nome: 'Fã de Carteirinha', descricao: '10 filmes assistidos com o mesmo ator.',
    icone: 'ti-user-star', target: 10,
    progress: (l) => {
      const c = {}
      l.filter(f => f.assistido).flatMap(f => f.atores || []).forEach(a => { if (a) c[a] = (c[a] || 0) + 1 })
      return Math.max(0, ...Object.values(c), 0)
    },
    check: (l) => {
      const c = {}
      l.filter(f => f.assistido).flatMap(f => f.atores || []).forEach(a => { if (a) c[a] = (c[a] || 0) + 1 })
      return Object.values(c).some(q => q >= 10)
    },
  },
  {
    id: 'completista', nome: 'Diretor Favorito', descricao: '5 filmes assistidos do mesmo diretor.',
    icone: 'ti-crown', target: 5,
    progress: (l) => {
      const c = {}
      l.filter(f => f.assistido).flatMap(f => f.direcao || []).forEach(d => { if (d) c[d] = (c[d] || 0) + 1 })
      return Math.max(0, ...Object.values(c), 0)
    },
    check: (l) => {
      const c = {}
      l.filter(f => f.assistido).flatMap(f => f.direcao || []).forEach(d => { if (d) c[d] = (c[d] || 0) + 1 })
      return Object.values(c).some(q => q >= 5)
    },
  },
  {
    id: 'maratonista', nome: 'Maratonista', descricao: '10 filmes assistidos no mesmo mês.',
    icone: 'ti-walk', target: 10,
    progress: (l) => {
      const c = {}
      l.filter(f => f.assistido && f.dataAssistido).forEach(f => {
        const m = f.dataAssistido.slice(0, 7)
        c[m] = (c[m] || 0) + 1
      })
      return Math.max(0, ...Object.values(c), 0)
    },
    check: (l) => {
      const c = {}
      l.filter(f => f.assistido && f.dataAssistido).forEach(f => {
        const m = f.dataAssistido.slice(0, 7)
        c[m] = (c[m] || 0) + 1
      })
      return Object.values(c).some(q => q >= 10)
    },
  },
  {
    id: 'generos_5', nome: 'Cidadão do Mundo', descricao: '5 gêneros diferentes assistidos.',
    icone: 'ti-globe', target: 5,
    progress: (l) => new Set(l.filter(f => f.assistido).flatMap(f => f.genero || [])).size,
    check: (l) => new Set(l.filter(f => f.assistido).flatMap(f => f.genero || [])).size >= 5,
  },
  {
    id: 'sequencia_7', nome: 'Semana Cinéfila', descricao: '7 dias seguidos assistindo.',
    icone: 'ti-calendar-check', target: 7,
    progress: (l) => calcStreak(l),
    check: (l) => calcStreak(l) >= 7,
  },
  {
    id: 'media_8', nome: 'Padrão Elevado', descricao: 'Média geral acima de 8.',
    icone: 'ti-chart-line', target: 1,
    progress: (l) => {
      const ass = l.filter(f => f.assistido && f.nota)
      if (!ass.length) return 0
      return parseFloat((ass.reduce((a, f) => a + f.nota, 0) / ass.length).toFixed(1))
    },
    check: (l) => {
      const ass = l.filter(f => f.assistido && f.nota)
      if (!ass.length) return false
      return ass.reduce((a, f) => a + f.nota, 0) / ass.length >= 8
    },
  },
  {
    id: 'critico_equilibrado', nome: 'Crítico Equilibrado', descricao: 'Deu notas entre 5 e 9 para mais de 50 filmes.',
    icone: 'ti-scale', target: 50,
    progress: (l) => l.filter(f => f.nota >= 5 && f.nota <= 9).length,
    check: (l) => l.filter(f => f.nota >= 5 && f.nota <= 9).length >= 50,
  },
  {
    id: 'explorador', nome: 'Explorador', descricao: 'Assistiu filmes de 10 décadas diferentes.',
    icone: 'ti-compass', target: 10,
    progress: (l) => new Set(l.filter(f => f.assistido && f.ano).map(f => Math.floor(f.ano / 10) * 10)).size,
    check: (l) => new Set(l.filter(f => f.assistido && f.ano).map(f => Math.floor(f.ano / 10) * 10)).size >= 10,
  },
  {
    id: 'enciclopedia', nome: 'Enciclopédia', descricao: '300 filmes cadastrados.',
    icone: 'ti-books', target: 300,
    progress: (l) => Math.min(l.length, 300),
    check: (l) => l.length >= 300,
  },
  {
    id: 'binge_watcher', nome: 'Binge Watcher', descricao: '5 filmes assistidos no mesmo dia.',
    icone: 'ti-device-tv', target: 5,
    progress: (l) => {
      const c = {}
      l.filter(f => f.assistido && f.dataAssistido).forEach(f => {
        const d = f.dataAssistido.slice(0, 10)
        c[d] = (c[d] || 0) + 1
      })
      return Math.max(0, ...Object.values(c), 0)
    },
    check: (l) => {
      const c = {}
      l.filter(f => f.assistido && f.dataAssistido).forEach(f => {
        const d = f.dataAssistido.slice(0, 10)
        c[d] = (c[d] || 0) + 1
      })
      return Object.values(c).some(q => q >= 5)
    },
  },
  {
    id: 'classico', nome: 'Clássico', descricao: 'Assistiu 10 filmes anteriores a 1980.',
    icone: 'ti-history', target: 10,
    progress: (l) => l.filter(f => f.assistido && f.ano && f.ano < 1980).length,
    check: (l) => l.filter(f => f.assistido && f.ano && f.ano < 1980).length >= 10,
  },
]

function getDetalhe(id, filmes) {
  switch (id) {
    case 'fa_carteirinha': {
      const c = {}
      filmes.filter(f => f.assistido).flatMap(f => f.atores || []).forEach(a => { if (a) c[a] = (c[a] || 0) + 1 })
      const top = Object.entries(c).sort((a, b) => b[1] - a[1])
      return top.filter(([,n]) => n >= 10).map(([a, n]) => `${a} (${n} filmes)`).join(', ') || null
    }
    case 'completista': {
      const c = {}
      filmes.filter(f => f.assistido).flatMap(f => f.direcao || []).forEach(d => { if (d) c[d] = (c[d] || 0) + 1 })
      const top = Object.entries(c).sort((a, b) => b[1] - a[1])
      return top.filter(([,n]) => n >= 5).map(([d, n]) => `${d} (${n} filmes)`).join(', ') || null
    }
    case 'maratonista': {
      const c = {}
      filmes.filter(f => f.assistido && f.dataAssistido).forEach(f => {
        const m = f.dataAssistido.slice(0, 7)
        c[m] = (c[m] || 0) + 1
      })
      const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]
      if (top && top[1] >= 10) {
        const [ano, mes] = top[0].split('-')
        const data = new Date(parseInt(ano), parseInt(mes) - 1)
        return `${data.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })} — ${top[1]} filmes`
      }
      return null
    }
    case 'nacional_5': {
      const n = filmes.filter(f => f.origem === 'Nacional' && f.assistido).length
      return n >= 10 ? `${n} filmes nacionais assistidos` : null
    }
    default:
      return null
  }
}

export function calcularConquistas(filmes) {
  return CONQUISTAS.map(c => ({
    ...c,
    unlocked: c.check(filmes),
    progressoAtual: Math.min(c.progress(filmes), c.target),
    detalhe: c.check(filmes) ? getDetalhe(c.id, filmes) : null,
  }))
}