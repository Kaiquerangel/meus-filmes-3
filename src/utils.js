/**
 * Calcula a sequência atual de dias consecutivos assistindo filmes.
 * Parte do dia de hoje para trás e conta enquanto houver dias consecutivos.
 *
 * @param {Array} lista - Lista de filmes do usuário
 * @returns {number} Número de dias seguidos
 */
export function calcStreak(lista) {
  const dias = new Set(
    lista
      .filter(f => f.assistido && f.dataAssistido)
      .map(f => f.dataAssistido.slice(0, 10))
  )
  if (!dias.size) return 0

  const toDayNum = (str) => {
    const [y, m, d] = str.split('-').map(Number)
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000)
  }

  const sortedNums = [...dias].map(toDayNum).sort((a, b) => a - b)

  // Parte do dia mais recente e conta para trás dias consecutivos
  let streak = 1
  for (let i = sortedNums.length - 1; i > 0; i--) {
    if (sortedNums[i] - sortedNums[i - 1] === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}