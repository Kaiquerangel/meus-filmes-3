import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppStore } from '../store/useAppStore'

async function buscarPerfilPorNickname(nickname) {
  const semArroba = nickname.replace('@', '').trim()
  const lower = semArroba.toLowerCase()

  const tentativas = [
    { campo: 'nickname_lower', valor: lower },
    { campo: 'nickname_lower', valor: semArroba },
    { campo: 'nickname', valor: semArroba },
    { campo: 'nickname', valor: '@' + semArroba },
    { campo: 'nickname', valor: lower },
    { campo: 'nickname', valor: '@' + lower },
  ]

  for (const t of tentativas) {
    try {
      const q = query(collection(db, 'users'), where(t.campo, '==', t.valor))
      const snap = await getDocs(q)
      if (!snap.empty) {
        return snap.docs[0].data()
      }
    } catch {
      // tentativa falhou, continua para a próxima
    }
  }

  return null
}

async function buscarFilmesDoUsuario(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'filmes'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

function calcularAfinidade(filmesA, filmesB) {
  const assA = filmesA.filter(f => f.assistido && f.nota)
  const assB = filmesB.filter(f => f.assistido && f.nota)
  const titulosA = new Set(assA.map(f => f.titulo.toLowerCase()))
  const titulosB = new Set(assB.map(f => f.titulo.toLowerCase()))
  const emComum = [...titulosA].filter(t => titulosB.has(t))
  if (!emComum.length) return 0

  const difsNota = emComum.map(titulo => {
    const fA = assA.find(f => f.titulo.toLowerCase() === titulo)
    const fB = assB.find(f => f.titulo.toLowerCase() === titulo)
    return Math.abs((fA?.nota || 0) - (fB?.nota || 0))
  })
  const mediaDif = difsNota.reduce((a, b) => a + b, 0) / difsNota.length
  return Math.round(Math.max(0, 100 - mediaDif * 15))
}

function topGenero(filmes) {
  const g = {}
  filmes.filter(f => f.assistido).flatMap(f => f.genero || []).forEach(x => { g[x] = (g[x] || 0) + 1 })
  return Object.entries(g).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
}

function topDiretor(filmes) {
  const d = {}
  filmes.flatMap(f => f.direcao || []).forEach(x => { if (x) d[x] = (d[x] || 0) + 1 })
  return Object.entries(d).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
}

function mediaNota(filmes) {
  const c = filmes.filter(f => f.assistido && f.nota)
  if (!c.length) return '—'
  return (c.reduce((a, f) => a + f.nota, 0) / c.length).toFixed(1)
}

function filmesEmComum(filmesA, filmesB) {
  const titulosB = new Set(filmesB.filter(f => f.assistido).map(f => f.titulo.toLowerCase()))
  return filmesA.filter(f => f.assistido && titulosB.has(f.titulo.toLowerCase()))
}

function maioresDivergencias(filmesA, filmesB) {
  const assB = filmesB.filter(f => f.assistido && f.nota)
  const mapB = {}
  assB.forEach(f => { mapB[f.titulo.toLowerCase()] = f })
  return filmesA
    .filter(f => f.assistido && f.nota && mapB[f.titulo.toLowerCase()])
    .map(f => ({
      filme: f,
      notaA: f.nota,
      notaB: mapB[f.titulo.toLowerCase()].nota,
      dif: Math.abs(f.nota - mapB[f.titulo.toLowerCase()].nota),
    }))
    .filter(x => x.dif >= 2)
    .sort((a, b) => b.dif - a.dif)
    .slice(0, 5)
}

function filmesRecomendados(filmesA, filmesB) {
  const titulosA = new Set(filmesA.filter(f => f.assistido).map(f => f.titulo.toLowerCase()))
  return filmesB
    .filter(f => f.assistido && !titulosA.has(f.titulo.toLowerCase()))
    .sort((a, b) => (b.nota || 0) - (a.nota || 0))
    .slice(0, 10)
}

export default function ModalComparar({ onFechar }) {
  const meuPerfil = useAppStore(s => s.userProfile)
  const meusFilmes = useAppStore(s => s.filmes)

  const [etapa, setEtapa] = useState('input')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [amigo, setAmigo] = useState(null)
  const [filmesAmigo, setFilmesAmigo] = useState([])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleComparar = async () => {
    if (!nickname.trim()) return
    setErro('')
    setLoading(true)
    try {
      const perfil = await buscarPerfilPorNickname(nickname)
      if (!perfil) { setErro('Usuário não encontrado. Verifique o nickname.'); return }
      if (perfil.uid === meuPerfil?.uid) { setErro('Você não pode comparar com você mesmo!'); return }
      const filmes = await buscarFilmesDoUsuario(perfil.uid)
      setAmigo(perfil)
      setFilmesAmigo(filmes)
      setEtapa('resultado')
    } catch {
      setErro('Erro ao buscar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const afinidade     = amigo ? calcularAfinidade(meusFilmes, filmesAmigo) : 0
  const emComum       = amigo ? filmesEmComum(meusFilmes, filmesAmigo) : []
  const divergencias  = amigo ? maioresDivergencias(meusFilmes, filmesAmigo) : []
  const amigoRecomenda = amigo ? filmesRecomendados(meusFilmes, filmesAmigo) : []
  const euRecomendo   = amigo ? filmesRecomendados(filmesAmigo, meusFilmes) : []

  const corAfinidade = afinidade >= 80 ? '#32d74b' : afinidade >= 60 ? 'var(--accent)' : afinidade >= 40 ? '#ff9500' : '#ff453a'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,10,11,0.92)' }}
      onClick={onFechar}
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxWidth: 520, background: 'var(--bg)', border: '1px solid var(--border)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ══ ETAPA 1: INPUT ══ */}
        {etapa === 'input' && (
          <div style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🤝</div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6, letterSpacing: '-.3px' }}>
              Comparar com Amigo
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.5 }}>
              Digite o nickname ou cole o link público do perfil do seu amigo.
            </p>

            <input
              className="input"
              placeholder="@nickname ou link do perfil"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComparar()}
              autoFocus
              style={{ marginBottom: 8, textAlign: 'center' }}
            />
            <p style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 24 }}>
              Ex: <strong style={{ color: 'var(--text-3)' }}>
                {meuPerfil?.nickname || 'kaique-rangel'}
              </strong> ou link do perfil público
            </p>

            {erro && (
              <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <i className="ti ti-alert-circle" /> {erro}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleComparar}
                disabled={loading || !nickname.trim()}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 'var(--radius-lg)', fontSize: 14, fontWeight: 600,
                  background: 'var(--accent)', color: 'var(--btn-text)', border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  opacity: loading ? .7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {loading
                  ? <><i className="ti ti-loader-2 animate-spin" /> Buscando...</>
                  : <>Comparar →</>
                }
              </button>
              <button
                onClick={onFechar}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 'var(--radius-lg)', fontSize: 14,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ══ ETAPA 2: RESULTADO ══ */}
        {etapa === 'resultado' && amigo && (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', textAlign: 'center', flexShrink: 0 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-.3px' }}>
                ⚡ {meuPerfil?.nome || 'Você'} vs {amigo.nome}
              </h2>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
              <div style={{ padding: '20px 20px 0' }}>

                {/* Perfis + afinidade */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--btn-text)', margin: '0 auto 8px' }}>
                      {meuPerfil?.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{meuPerfil?.nome}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>@{meuPerfil?.nickname}</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0 8px' }}>
                    <div style={{ fontSize: 30, fontWeight: 700, color: corAfinidade, letterSpacing: '-.5px' }}>{afinidade}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>afinidade</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', background: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 auto 8px' }}>
                      {amigo.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#4da6ff' }}>{amigo.nome}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>@{amigo.nickname}</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
                  {[
                    { label: 'Cadastrados',   meu: meusFilmes.length,                                  amigo: filmesAmigo.length },
                    { label: 'Assistidos',    meu: meusFilmes.filter(f => f.assistido).length,         amigo: filmesAmigo.filter(f => f.assistido).length },
                    { label: 'Nota média',    meu: mediaNota(meusFilmes),                              amigo: mediaNota(filmesAmigo), destaque: true },
                    { label: 'Gênero fav.',   meu: topGenero(meusFilmes),                              amigo: topGenero(filmesAmigo), texto: true },
                    { label: 'Dir. favorito', meu: topDiretor(meusFilmes),                             amigo: topDiretor(filmesAmigo), texto: true },
                  ].map((row, i) => (
                    <div
                      key={row.label}
                      style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '10px 16px', alignItems: 'center', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}
                    >
                      <div style={{ fontSize: row.texto ? 12 : 16, fontWeight: row.texto ? 400 : 700, color: 'var(--accent)', textAlign: 'left', letterSpacing: row.texto ? 0 : '-.3px' }}>
                        {row.meu}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center', padding: '0 12px' }}>
                        {row.label}
                      </div>
                      <div style={{ fontSize: row.texto ? 12 : 16, fontWeight: row.texto ? 400 : 700, color: '#4da6ff', textAlign: 'right', letterSpacing: row.texto ? 0 : '-.3px' }}>
                        {row.amigo}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filmes em comum */}
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.5px' }}>{emComum.length}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>filmes em comum na coleção</div>
                  {emComum.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {emComum.slice(0, 8).map(f => (
                        <div key={f.id} style={{ width: 44, height: 64, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0 }}>
                          {f.poster && f.poster !== 'N/A'
                            ? <img src={f.poster} alt={f.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="ti ti-movie" style={{ fontSize: 14, color: 'var(--border2)' }} />
                              </div>
                          }
                        </div>
                      ))}
                      {emComum.length > 8 && (
                        <div style={{ width: 44, height: 64, borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>+{emComum.length - 8}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Divergências */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="ti ti-arrows-diff" style={{ color: 'var(--accent)', fontSize: 13 }} />
                    Maiores divergências de nota —
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Você</span>
                    vs
                    <span style={{ color: '#4da6ff', fontWeight: 700 }}>{amigo.nome}</span>
                  </div>
                  {divergencias.length === 0
                    ? <p style={{ fontSize: 13, color: 'var(--text-4)', textAlign: 'center', padding: '12px 0' }}>
                        Nenhuma divergência grande nas notas 🤝
                      </p>
                    : divergencias.map(({ filme, notaA, notaB, dif }) => (
                        <div key={filme.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ width: 32, height: 46, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0 }}>
                            {filme.poster && filme.poster !== 'N/A'
                              ? <img src={filme.poster} alt={filme.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <i className="ti ti-movie" style={{ fontSize: 12, color: 'var(--border2)' }} />
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', marginBottom: 2 }}>{filme.titulo}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>★ {notaA.toFixed(1)}</span>
                              <span style={{ fontSize: 11, color: 'var(--text-4)' }}>vs</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#4da6ff' }}>★ {notaB.toFixed(1)}</span>
                              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,69,58,0.1)', color: 'var(--red)' }}>Δ {dif.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                  }
                </div>

                {/* Amigo recomenda */}
                {amigoRecomenda.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className="ti ti-star" style={{ color: '#4da6ff', fontSize: 12 }} />
                      {amigo.nome} recomenda — você ainda não assistiu
                    </div>
                    {amigoRecomenda.map(f => (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 32, height: 46, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0 }}>
                          {f.poster && f.poster !== 'N/A'
                            ? <img src={f.poster} alt={f.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <i className="ti ti-movie" style={{ fontSize: 12, color: 'var(--border2)' }} />
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>{f.titulo}</div>
                          <div style={{ fontSize: 11, color: '#4da6ff' }}>★ {f.nota?.toFixed(1)} por {amigo.nome}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Eu recomendo */}
                {euRecomendo.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className="ti ti-star" style={{ color: 'var(--accent)', fontSize: 12 }} />
                      Você recomenda — {amigo.nome} ainda não assistiu
                    </div>
                    {euRecomendo.map(f => (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 32, height: 46, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0 }}>
                          {f.poster && f.poster !== 'N/A'
                            ? <img src={f.poster} alt={f.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <i className="ti ti-movie" style={{ fontSize: 12, color: 'var(--border2)' }} />
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>{f.titulo}</div>
                          <div style={{ fontSize: 11, color: 'var(--accent)' }}>★ {f.nota?.toFixed(1)} na sua lista</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setEtapa('input'); setAmigo(null); setNickname('') }}
                style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-lg)', fontSize: 13, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Comparar outro
              </button>
              <button
                onClick={onFechar}
                style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-lg)', fontSize: 13, fontWeight: 600, background: 'var(--accent)', border: 'none', color: 'var(--btn-text)', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}